---
title: "Example post — how to write an article"
description: "A short summary shown on the home page and in link previews."
date: 2026-10-20
tags: ["example"]
draft: true
---

This is an example article. Because `draft: true` is set above, it only shows up
when you run the site locally (`npm run dev`) and is **never published**.

To write a new article, copy this file, give it a new name (the file name becomes
the URL, e.g. `evaluating-llm-chatbots.md` → `/posts/evaluating-llm-chatbots/`),
update the title, description and date, then set `draft: false` when it's ready.

## Headings, lists and code work as usual

- Write in plain Markdown
- Use `##` for sections

```python
def hello():
    return "Hello, world"
```

> Quotes look like this.
