---
title: "Do you still need an intent taxonomy?"
description: "Letting the model route straight to tools is fast and often the right call. Here's where I think it stops being one."
date: 2026-10-20
tags: ["conversational AI", "LLM", "evaluation", "architecture"]
draft: true
---

In my [previous post](/blog/posts/llm-should-not-run-conversation/), I described an architecture
where an orchestrator, not the LLM, runs the conversation: an intent taxonomy, explicit
conversation threads, clarification and reformulation.

It would be dishonest to stop there without discussing the approach that challenges it today:
**drop the intent taxonomy and let the model route directly to tools.** Every capability
becomes a tool, the model picks which one to call, and the orchestrator shrinks down to an
execution loop.

## The case for direct routing

The arguments are strong. The whole design layer disappears. Adding a capability means writing
one more tool description. And the system improves every time the underlying models do, with
no engineering effort.

On a narrow scope, with few tools and reversible actions, it's very hard to beat on speed of
delivery. For a prototype or a narrow domain, I think it's the right default.

## What changes at scale

As the system grows, two properties show up. They have less to do with any particular
implementation than with the nature of the approach itself.

### Evaluation loses its reference point

Evaluating a system means comparing what it did with what you expected. When the path to a
resolution isn't constrained, there's no expected sequence anymore: the model can reach the
same outcome through different routes, and two correct runs won't look alike.

You can still judge the final answer. What you lose is the ability to pinpoint *where* a
conversation went wrong, or to build a reference dataset without freezing exactly what the
approach chose not to freeze. In practice, evaluation drifts toward manual review of sampled
conversations, with the hard problem that comes with it: catching a regression before a user
reports it.

### Cost per turn grows with the conversation

Without persistent state, part of the reasoning has to be rebuilt on every message: re-read the
history, re-infer the current goal, re-select the tool. That cost grows with the length of the
conversation and the number of exposed tools, whereas explicit state keeps it roughly constant.

A three- to four-fold increase in average response time is not unusual. And there's a side
effect that's easy to underestimate: calling systems have to raise their timeouts, and the
constraint ripples through the whole chain.

## A threshold, not a doctrine

So my criterion isn't a matter of school of thought. It's a threshold.

As long as the scope stays narrow and actions are reversible, direct routing is an excellent
choice. Once the number of intents grows, some actions become irreversible (cancelling an
order, changing a delivery address), and you need to measure quality before every release,
explicit state stops being overhead. It becomes what makes the system operable at all.

Building a conversational agent isn't mainly about picking a strong model. It's an
architectural decision: how much of the conversation do you hand over to the model, and how
much do you keep explicit in the system? In the right context, an intent taxonomy, explicit
threads and clarification mechanisms aren't added complexity. They're what make the agent's
behavior observable, testable and reproducible.

That claim deserves its own check, though: an architecture is only as good as the measurements
that come with it. Evaluation, observability and continuous improvement will be the topic of a
future post.
