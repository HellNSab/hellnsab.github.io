---
title: "After the release: tracing, feedback and A/B tests for a conversational agent"
description: "Evaluations tell you a change is safe to ship. Here's how to find out what actually happens once real users talk to your agent."
date: 2026-10-20
tags: ["conversational AI", "LLM", "observability", "metrics"]
draft: true
---

[Evaluations](/posts/what-to-evaluate-in-an-llm-agent/) tell you whether a change is safe to
ship. They don't tell you how the agent behaves once thousands of real users start talking to
it. For that, you need three things working together: traces that explain what the agent did,
feedback that tells you what users thought of it, and experiments that tell you which version
works better.

## Trace the agent's structure, not just its model calls

User feedback tells you when people are unhappy. Logs are supposed to tell you why, but raw
application logs rarely do. A flat stream of model calls gives you no idea what the agent was
trying to accomplish, and that gap becomes painfully obvious the first time someone reports
that the bot "gave a weird answer" and you have nothing useful to look at.

What actually helps is tracing that mirrors the agent's own structure.

I've used Datadog's LLM Observability SDK for this, and it makes the work fairly painless. Calls
to supported model providers are instrumented automatically: model, prompt, completion, token
usage, latency and errors are captured without touching your code, once tracing is enabled with
a few environment variables at startup. Anything else can be traced explicitly:

```python
from ddtrace.llmobs.decorators import llm

@llm(model_name="my-model", model_provider="custom")
def classify_intent(user_prompt):
    completion = ...  # call the model
    return completion
```

The useful mental model is this: **the model calls trace themselves; your job is to trace the
glue around them.** That glue is where the interesting failures live, and it's where the other
decorators come in:

- `@agent` for a loop where the model decides what to do next;
- `@workflow` for a fixed sequence of steps;
- `@tool` for calls to external APIs or databases;
- `@task` for steps like reformulation or preprocessing.

Child spans nest under whatever triggered them, so a conversation turn becomes a tree instead
of a flat list: intent classification, the tool call it triggered, the final generation. The
first time a trace shows you at a glance that one slow database call is eating your whole
latency budget, the instrumentation work has paid for itself. Datadog's
[post on chain tracing](https://www.datadoghq.com/blog/llm-observability-chain-tracing/) has
good examples of what these trees look like.

### Make traces queryable

Annotations are what turn traces from readable into *queryable*: attaching the thread ID, the
detected intent, the model version.

```python
from ddtrace.llmobs import LLMObs
from ddtrace.llmobs.decorators import workflow

@workflow
def handle_turn(user_prompt, thread_id, intent):
    response = ...  # orchestration and model calls
    LLMObs.annotate(
        input_data=user_prompt,
        output_data=response,
        tags={"thread_id": thread_id, "intent": intent},
    )
    return response
```

Here's the part that's easy to miss: if you attach the **same metadata to user feedback**, you
can go from a thumbs-down straight to the trace that caused it. That link is cheap to build on
day one and expensive to retrofit later.

From there, dashboards and alerts on latency percentiles, error rates and token cost per
workflow give you the live picture.

None of this requires Datadog, which is a paid product. The approach follows OpenTelemetry's
GenAI conventions, and the same span hierarchy can be built with open-source tooling. The tool
matters far less than the discipline of instrumenting your agent's structure rather than just
its outputs.

## Measure satisfaction with several signals

You can't improve what you don't measure. But satisfaction is subjective and has several
dimensions, so no single metric captures it. The practical approach is to combine complementary
signals that work at different levels of detail.

**Thumbs up / thumbs down** is the most immediate. It's low-friction and high-volume, ideal for
spotting trends. The key decision is *when* to ask: prompting after every response teaches users
to ignore it. If your orchestrator tracks
[conversation threads](/posts/llm-should-not-run-the-conversation/), there's a natural trigger:
ask only when a thread is closed after doing real work (a tracked order, a resolved account
issue), not after small talk or an abandoned thread. Even then, limit it to once or twice per
session to avoid feedback fatigue.

**Surveys** fill the gap that thumbs leave: they tell you something worked, rarely *why*.
Proactive surveys, offered mid-conversation, get more responses but interrupt the flow and skew
toward strong emotions. Passive surveys, shown at the end of a session, are less intrusive and
more balanced, but fewer people answer. The sustainable pattern is to let micro-feedback carry
the continuous signal, and keep surveys for periodic deep dives on a small sample of sessions.

**Retention** captures whether satisfaction turns into lasting value: once someone has used the
agent, do they come back? It's reliable for authenticated users, but shaky for anonymous ones.
Session IDs, cookies and fingerprinting break down across devices and privacy-focused browsers,
so a "new" user may well be a returning one. Treat anonymous retention as a rough lower bound.

**Escalation to a human**, if your agent offers it, is one of the most telling signals of all: it
measures how often the agent can't solve the problem on its own. Bringing that rate down means
covering more of your users' issues without a human in the loop.

### Store metrics with their context

Whatever you collect is only as useful as your ability to interpret it later. Persist metrics
long-term, linked to conversation metadata: the intent, the tools called, the thread state, the
model version, the timestamp.

A thumbs-down on its own tells you little. The same thumbs-down in context tells you which
intents underperform, or whether satisfaction dropped right after a deployment. Once feedback
sits next to the full record of what the agent did, turn by turn, it becomes one signal in a
much bigger picture.

## Decide with A/B tests

With evaluations, monitoring and satisfaction metrics in place, you can start making decisions
based on data rather than instinct, or on assumptions about what users prefer.

That's as true for AI applications as for any other product. A/B tests take time and need a lot
in place before they're useful, but the insight they give is hard to get any other way. Once
you've confirmed that your metrics reflect something real, and you can follow satisfaction per
experiment group, almost any decision can be tested: a new prompt, a different model, a new
fallback behavior.

Two practical points on the technical setup:

- **Log which variant each user saw**, at the level of a session or even a single message, so
  every metric can be split by experiment.
- **Agree on one way to propagate experiment information** through every component of the
  system. [OpenTelemetry Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/) is a
  standard way to do it, and it means your traces and dashboards can be split by variant too.

## The loop

Put together, this forms a loop: evaluations catch regressions before release; traces explain
what happens in production; satisfaction metrics show where users struggle; A/B tests settle
which fix actually works. Then the next change goes back through evaluation.

None of these pieces is enough on its own. Together, they're what lets you improve a
conversational agent steadily, instead of reacting to the latest complaint.
