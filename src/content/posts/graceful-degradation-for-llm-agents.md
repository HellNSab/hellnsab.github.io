---
title: "Designing graceful degradation for an LLM agent"
description: "An agent inherits the failures of every tool it calls. Here's how I think about degrading on purpose instead of failing outright."
date: 2026-10-20
tags: ["conversational AI", "LLM", "reliability", "architecture"]
draft: true
---

A conversational agent rarely works alone. A single conversation can fan out to a product
search tool, a store-information API and a couple of specialized sub-agents, on top of the
LLM calls themselves. Each of those is a dependency, and the agent inherits every one of their
failures: if one tool slows down or goes away, the user-facing assistant degrades with it.

Traffic growth makes this worse in two ways. More users means more pressure on every downstream
service, and it also means your own token consumption grows, sometimes faster than anyone
budgeted for.

The default behavior of most systems in that situation is binary: things work, or the user
gets an error. For an assistant people rely on, I think there's a much better option, which is
to **degrade on purpose**. This post walks through how I'd design that.

## Make degradation an explicit state

The core idea is to give the orchestrator a small set of behavior presets it can switch between
at runtime:

- **`NORMAL`**: full feature set, every tool available.
- **`SLIGHTLY_DEGRADED`**: partial fallbacks, for example a static API instead of a live tool.
- **`DEGRADED`**: a reduced feature set, with the most expensive or most fragile features
  turned off.

Each tool then gets its own fallback rule. If a specialized sub-agent is down, redirect the
user to a more general one that still works. If a live store-information tool is too slow,
answer from a static, cached source instead. The user gets a slightly less rich answer rather
than no answer at all.

The presets live in a shared configuration store (Redis works well) that the orchestrator reads
on every request, so behavior changes take effect immediately without a redeploy.

This fits naturally with the architecture from my
[earlier post](/blog/posts/llm-should-not-run-conversation/): when the orchestrator, not the
model, decides what happens next, degradation is just another input to that decision. It's
explicit, testable and visible, instead of being whatever the model improvises when a tool call
times out.

The hard part, of course, isn't switching presets. It's knowing *when* to switch.

## Detecting trouble: ping, or listen?

There are two broad ways to know a dependency is unhealthy.

**Active health checks.** A separate process pings each tool on a schedule and keeps a rolling
window of recent results, say the last ten. Too many failures in the window, and the tool is
flagged as degraded. The big advantage is early warning: you can detect a failure *before* a
user hits it.

**Passive detection.** Instead of pinging, you record the outcome of real calls as they happen.
No extra process, no synthetic traffic, and the signal reflects exactly what users experience.

For a first version, I'd lean toward passive detection, for one practical reason. The
orchestrator almost certainly runs on several replicas, and if each one pings every tool, you
multiply the health-check traffic by the number of pods and get as many slightly different
views of the world. With passive detection, each replica writes its failures to a shared
structure (a Redis sorted set keyed by timestamp makes a simple rolling window), and every
replica reads the same consistent state.

The trade-off is worth writing down explicitly: **for a low-traffic tool, a failure is only
detected after a user has already hit it.** That's an accepted limitation, not an oversight.
If it ever causes a real incident, the fix is a single, cluster-wide health checker on top,
not one per pod.

## Your own system is a dependency too

External tools are easy to reason about: they have an endpoint you can watch. Two of the most
important signals don't: your own latency and your own token consumption. There's nothing to
ping; the signal only exists when there's traffic.

So those have to be measured from inside the request path. Every LLM call already goes through
the orchestrator, which makes it the natural place to record latency and token usage into the
same kind of rolling window, and to reuse the same three presets when thresholds are crossed.

But I'd treat the two signals differently:

- **Latency can stay reactive.** When it crosses a threshold, degrade, just as you would for a
  slow external tool.
- **Token cost should be proactive.** By the time you notice you've blown through your budget,
  the money is spent. A budget per time window ("X tokens per ten minutes") lets you start
  degrading *before* you hit the limit, not after.

## The replica trap

This is the question I'd most want to settle before writing any code, because it's very easy to
discover it in production instead.

If the orchestrator runs as a single instance, one in-process component sees all the traffic,
and its rolling window is the truth. But the whole premise of this work is growing traffic, so
the orchestrator will scale horizontally, and then each instance only sees its own share.

That leaves two options:

1. **Per-instance thresholds.** Each pod protects itself based on what it sees locally. Simple,
   no coordination, but the system as a whole has no single picture of its health.
2. **A global state.** Either a central aggregator collects metrics from every instance, or each
   instance writes to and reads from a shared store before deciding. More consistent, more
   moving parts.

Neither is wrong. What matters is making the choice explicitly, and writing down why.

## Measure before you pick thresholds

How many failures out of ten is "degraded"? Over what window: twenty minutes, an hour? It's
tempting to pick numbers that feel reasonable. I'd rather start by logging failures per tool for
a few weeks, without acting on them, to see what normal noise actually looks like. Then choose
thresholds per tool based on that data. A tool that blips twice a day and a tool that never
fails don't deserve the same rule.

## Never degrade silently

A degraded mode that nobody notices is just a slow-motion incident. Every state change should be
logged with a timestamp and should trigger an alert, so the team knows the assistant is running
with reduced capabilities and why.

And once the presets have been live for a while, they're worth evaluating like any other
feature. Do users still get what they need in degraded mode? Comparing satisfaction between
normal and degraded conversations, or even A/B testing different fallbacks, tells you whether
your fallbacks are actually graceful, or just quieter failures.

## Wrapping up

Graceful degradation isn't one mechanism. It's a set of small, explicit decisions: what each
tool falls back to, how failures are detected, how your own cost and latency are watched, how
replicas share a view of the world, and how loudly the system tells you it's struggling.

None of these decisions is particularly hard on its own. The trap is leaving them implicit, and
letting production make them for you.
