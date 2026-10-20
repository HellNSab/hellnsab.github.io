---
title: "Evaluating an LLM agent is more deterministic than you think"
description: "LLM-as-a-judge is the obvious tool, but most of an agent can be tested with plain expected outputs. The hard part is deciding what to test."
date: 2026-10-20
tags: ["conversational AI", "LLM", "evaluation", "RAG"]
draft: true
---

In an [earlier post](/posts/do-you-need-an-intent-taxonomy/), I argued that one of the main
differences between agent architectures is how easy they are to evaluate. This post is the
follow-up: how I think about evaluating the prompts and models inside a conversational agent
before they reach production.

## Two families of evaluation

Broadly, there are two ways to evaluate a prompt.

**Non-deterministic evaluation** uses what's known as *LLM-as-a-judge*. Because you can't predict
the exact output of the prompt you're testing, you give another LLM a set of rules and ask it
whether the answer is correct.

It looks like the easier option to set up, and it's often where teams start. But it raises a
string of questions very quickly. Which model should judge which model? How do you know your
judge is right? How do you evaluate the evaluator prompt itself? You end up with a second
system to test, tune and keep stable.

**Deterministic evaluation** is the classic approach: a dataset of inputs with their expected
outputs, and a check that the prompt produces them.

It's tempting to assume this can't work with LLMs, since generation is inherently
non-deterministic. But that's only true of *some* prompts, and in a well-structured agent, it's
not true of most of them.

## Most prompts can be tested like regular code

Many prompts in an agent don't write free text at all. They **classify** (which intent is this?
which conversation thread does this message belong to?), **select** (which of these options
applies?) or **rank** (which of these documents is most relevant?).

For those, the right answer is predictable, so the dataset is straightforward: an input and the
expected label, choice or order. Evaluation becomes a matter of accuracy, results are stable for
a given prompt and model pair, and regressions show up as a number going down.

This is why architecture and evaluation are so closely linked. If an orchestrator keeps the
conversation logic in code and calls several small, specialized prompts, almost every one of
those prompts can be evaluated deterministically. If one large prompt makes most of the
decisions, you're pushed toward judging only the final answer.

### Even tool-using prompts have expected behavior

A larger prompt that chooses between tools before answering can still be partly tested this way.
In a given scenario, you can expect it to call some tools and not others, and sometimes to call
them in a specific order. Those are concrete, checkable data points, and they should also be
stable for a given prompt and model pair.

You won't be able to assert the exact wording of the final answer, but you can assert the
*trajectory*, and that's often where the bugs are.

## The real question: what should you test?

For a classification or ranking prompt, what to evaluate is obvious: is the result accurate?
For more complex components, it's a much more open question, and RAG pipelines are a good
example.

A RAG pipeline is made of several steps, and each can be evaluated separately. The generation
step, which writes text, is a good fit for LLM-as-a-judge. But one of the most important steps,
**document retrieval**, can be measured with classic information retrieval metrics.

Most people working in this space have heard of tools like [Ragas](https://docs.ragas.io/), and
the theory is well documented. But knowing the theory and applying it to a real use case are
two different things.

<!-- If this comes from your RAG side project, you could say so here, e.g.
     "On a document search assistant I've been building on the side, ..." -->

The same retrieval algorithm can give very different results depending on the shape of the
data. And the metrics don't always agree. A common example is **hit rate** (does a relevant
document appear in the top *k* results?) and **MRR**, the Mean Reciprocal Rank (how high does
the first relevant document appear?). A change can improve one and degrade the other: hybrid
search might surface a relevant document for more queries, while pushing the best match a few
positions down.

Neither number is wrong. Deciding which one matters, and building a test dataset that reflects
real questions, means understanding what users are actually looking for and what the documents
actually contain. That's where it gets interesting.

## Evaluation is domain work

That's the part I didn't expect when I started working on evaluations. Setting up the datasets,
pipelines and infrastructure is the technical side, and it's real work. But the harder part is
that evaluation forces you, as a developer, to get into the details of the domain: what a good
answer looks like, which mistakes matter, which edge cases users actually hit.

You can't write a good expected output for a question you don't understand. In that sense,
building evaluations is one of the best ways I know to learn the domain you're building for.

Evaluation tells you whether a change is safe *before* it ships. The next post looks at the
other half: knowing what's happening *after* it ships, with tracing, user feedback and A/B tests.
