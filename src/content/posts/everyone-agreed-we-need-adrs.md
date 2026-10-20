---
title: "Everyone agreed we needed decision records. Then nobody wrote one."
description: "Notes from the middle of introducing ADRs in a growing, multi-team project: why agreement isn't adoption, and what I'm trying to bridge the gap."
date: 2026-10-20
tags: ["teams", "process", "ADR"]
draft: true
---

This isn't a success story, at least not yet. It's a post written from the middle of something:
introducing Architecture Decision Records (ADRs) in my team. So far, the team agrees they're
needed, my PM and PO are backing the idea, and I'm still the only person who has written one.

I think that gap, between everyone agreeing and anyone doing, is more interesting than the
usual "here's what an ADR is" post. So here's where things stand.

## The problem wasn't architecture

The frustration had been building for a while, and it came from everywhere at once. Developers
and our PO struggled to follow topics. People weren't sure what the current spec was. Details
got forgotten. It was hard to tell who had decided what, and who knew what.

A lot of it came down to how information moved. Conversations were spread across too many
channels, and often happened in direct messages to individual developers. As the project grew
to involve several teams, each with their own developers, POs and PMs, the number of those
side conversations exploded.

And the scarcest resource was PM time. Product managers had to make the decisions, but they were
stretched thin, so questions waited for a free slot in their calendar to sync on specifics.
Then, once a decision was made in a call, it lived in the heads of whoever attended.

None of that is really an architecture problem. It's a decision problem: decisions were being
made, but not recorded anywhere people could find, follow or challenge them.

## Stretching the ADR format a little

Classic ADRs are short documents that capture one architectural decision: the context, the
options, what was decided and why. I liked the format because it's lightweight and it forces
you to write down the *why*, which is exactly what was getting lost.

But our problem was broader, so I adapted it. My first ADR was about extending our platform to
a new part of the organization, and it covered more than a technical choice:

- **a workflow at the top of the document**, showing how the topic was evolving, so anyone
  landing on it could see where things stood at a glance;
- **who needed to be told what, and when**, since several teams were involved;
- **the decisions only PMs could make**, each laid out with its impact on effort versus quality,
  so they could decide without needing a meeting to understand the trade-off;
- **the list of tasks to plan** once those decisions were made.

The template was handmade, and that turned out to matter: it was shaped around our actual pain
points rather than a generic best practice.

## Agreement is cheap

I reviewed the idea with our PO, PM and a couple of developers. Everyone liked it. One developer
agreed to write the next ADR on a topic he owned.

He never did, and I don't think that's a failure on his part. Saying "yes, good idea" costs
nothing. Writing the first document of a new kind, on top of your actual work, with no clear
moment when it's expected, costs a lot. Without a trigger, "I'll do it" quietly becomes "I'll do
it next time".

That was the most useful lesson so far: **a practice nobody disagrees with can still go
nowhere.** Agreement isn't the hard part. Habit is.

## What I'm doing about it

Rather than pushing harder on the same message, I'm trying to change the conditions:

- **Getting allies, not just approval.** I raised it with my PM in a one-on-one, to check he was
  still interested and to ask how we could build momentum together. He offered to help push it.
  A practice championed by a PM and a developer together carries more weight than one
  developer's side project.
- **Looking for natural occasions** where the PO or a developer can be asked for an ADR, instead
  of asking in the abstract.
- **Moving discussions into comments.** When a decision is being discussed in a corridor or a
  DM, I suggest putting it as a comment on the document instead, so the reasoning stays where
  everyone can see it.
- **Mentioning it constantly.** Not glamorous, but repetition is how a new habit becomes the
  normal thing to do.
- **Making the first draft cheap.** Offering to pair for half an hour on someone's first ADR,
  or turning an existing discussion thread into a draft they only need to correct. Editing is
  much easier than starting from a blank page.
- **Defining when an ADR is expected.** For example: any decision affecting more than one
  team, anything hard to reverse, or any trade-off a PM needs to arbitrate.
- **Answering with a link.** When a question comes in that an ADR already answers, including
  the link in the response, so the document becomes the place where answers live.

## Why I think it'll work

The need is real and widely felt. Nobody needs convincing that information is getting lost; the
complaints were there long before the ADRs were. And the format directly addresses the scarcest
resource we have: if decisions are laid out clearly, with their trade-offs, a PM can make them
asynchronously instead of waiting for a free slot.

What's missing is time and momentum. That's what I'm working on now.

I'll write a follow-up in a few months, whatever the outcome. If it works, I'll share what made
the difference. If it doesn't, that'll probably be the more useful post.
