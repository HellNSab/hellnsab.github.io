---
title: "Your LLM shouldn't be running the conversation"
description: "Intent taxonomies, conversation threads and clarification: the unglamorous architecture that keeps a conversational agent predictable in production."
date: 2026-10-20
tags: ["conversational AI", "LLM", "architecture"]
draft: true
---

Plugging an LLM into a chat window gets you a demo in an afternoon. Getting a conversational
agent that behaves predictably, recovers from errors and stays safe when real users start
talking to it is a different job.

The single most useful decision I've seen in that job is a separation of responsibilities:
**the LLM understands and produces language; it does not run the conversation.** Steering is
the job of an orchestrator, a regular piece of software that keeps track of conversation state,
picks the next action and coordinates the rest of the system.

This post walks through the foundations of that architecture: how to design the dialogue, and
how to build a conversation flow that survives contact with real users.

## Start with an intent taxonomy

The orchestrator needs a structured picture of what users can ask for. An intent taxonomy
gives it exactly that: a map from user needs to the behavior the agent should adopt.

**Define the scope before the intents.** What should the agent help with? Who is it for?
And just as important, what is explicitly *not* its job? Skipping this step is how you end up
with an agent that half-handles everything.

**Build from real behavior, not assumptions.** Conversation logs, support tickets, on-site
search queries and user interviews are all excellent sources. They show you the recurring
needs and the friction points, so the taxonomy reflects how people actually use the product.

**Organize intents hierarchically.** Start with broad categories, then refine. Each intent should
map to one clearly identifiable user goal, with as little overlap as possible. For an e-commerce
assistant, that could look like:

| Category | Intents |
|---|---|
| Orders | Track · Cancel · Return |
| Products | Search · Check availability |
| Customer account | View · Update |
| Support | Contact · Browse FAQ |

So "Where's my parcel?" resolves to **Orders → Track order**.

The taxonomy then becomes the orchestrator's reference. It tells it which flow to run, which
information to collect, which data it already knows about the user, and which tool or service
to call. And because behavior is organized around well-defined intents, you can add new
capabilities without breaking existing ones.

## Real conversations aren't linear

Users change topic, come back to an earlier question, or ask two things at once. An agent that
can't follow feels rigid, no matter how good its individual answers are.

One way to handle this is to model a conversation as a set of **independent threads**. Each
thread represents one user goal, with its own context, state and progress. A user can ask
about an order, break off to check whether a product is in stock, then come back to the order,
and neither topic loses its context.

Each thread moves through a small set of explicit states:

| From | Event | To |
|---|---|---|
| — | New intent detected | `OPENED` |
| `OPENED` | Missing information | `AWAITING_CLARIFICATION` |
| `OPENED` | Reformulation needs validation | `AWAITING_CONFIRMATION` |
| `AWAITING_CONFIRMATION` | User confirms | `OPENED` |
| `AWAITING_CONFIRMATION` | User rejects | `AWAITING_CLARIFICATION` |
| `AWAITING_CLARIFICATION` | User provides the information | `OPENED` |
| `OPENED` | User digresses | `PENDING_FOLLOWUP` |
| `PENDING_FOLLOWUP` | Thread resumed | `OPENED` |
| `OPENED` | Goal achieved | `CLOSED` |
| `PENDING_FOLLOWUP` | Abandoned or expired | `CLOSED` |

<!-- Diagram: export the thread state diagram from the original article to
     public/images/thread-states.png and uncomment the line below.
![Conversation thread states](/images/thread-states.png) -->

With these states, the orchestrator always knows where each conversation stands and can pick
up a thread exactly where it was left.

### Which thread does this message belong to?

On every new message, the LLM acts as a language-understanding component. Its job isn't to
decide what happens next, but to help the orchestrator answer one simple question:
**which thread does this message belong to?** The answer is one of three:

- it continues a thread that's already open;
- it opens a new thread;
- it returns to an older thread, detected through semantic search or a relevance score that
  takes recency into account.

That split between understanding and orchestration is what lets you support non-linear
conversations while keeping behavior deterministic, maintainable and easy to extend.

## Clarify or reformulate?

User requests are rarely perfect. They're incomplete, ambiguous, or spread over several
messages. Two complementary mechanisms handle this without stacking up guesses.

**Clarification** is for missing information. When something essential is absent, the
orchestrator moves the thread to `AWAITING_CLARIFICATION` and asks the user for it explicitly.
The benefit is that the logic stays visible: the orchestrator knows exactly why a thread is
paused and what will resume it. Adding states such as `AWAITING_CONFIRMATION` pushes even
more decisions out of the model's hands and into deterministic code.

**Reformulation** is for ambiguity. Everything needed is there, but scattered or implicit. The
goal is to rebuild one explicit request that captures what was actually understood. After a few
messages about an order, a user might write:

> Can you change it?

The orchestrator can turn that into:

> Change the delivery address of order #123.

That reformulation can go straight to a tool or a sub-agent. When confidence is low, it's shown
to the user for confirmation first.

## The loop, end to end

Put together, handling a message follows a fairly simple sequence:

1. identify the thread the message belongs to;
2. fetch that thread's context;
3. check whether information is missing;
4. if so, ask a clarifying question;
5. otherwise, generate a reformulation if the request is ambiguous;
6. either run the request right away, or ask the user to confirm first.

<!-- Diagram: export the message-processing flowchart to
     public/images/message-flow.png and uncomment the line below.
![Message processing flow](/images/message-flow.png) -->

Conversations feel more natural, risky assumptions are kept in check, and the orchestrator stays
in control. The LLM is used where it adds the most value: understanding intent and producing
natural language.

## What's next

This isn't the only way to build an agent. A growing school of thought drops the taxonomy
entirely and lets the model route straight to tools. That approach has real strengths, and I
think it's the right default in some cases. I'll look at where the line sits in the next post.
