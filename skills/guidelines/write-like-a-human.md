---
name: write-like-a-human
description: Rules for clear, natural, audience-appropriate writing. Use for documentation, plans, explanations, UI copy, pull requests, and code comments.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Write Like a Human

Write for the reader's task, not to perform helpfulness. Prefer plain,
specific language over generic polish.

## Rules

- Lead with the answer, action, or conclusion. Give context only when it helps
  the reader decide what to do next.
- Use concrete nouns and active verbs. Name the component, behavior, command,
  owner, or limitation instead of referring vaguely to "it," "this," or
  "various" things.
- Prefer short sentences and familiar words. Remove filler, hedging, sales
  language, and mannered prose.
- Do not use agent-isms such as "Certainly," "I hope this helps," "seamlessly,"
  "robust," "leverage," "delve," or "it's worth noting" unless they are the
  most precise wording in context.
- State facts as facts and uncertainty as uncertainty. Do not invent rationale,
  results, citations, user intent, or future work.
- Match the reader's vocabulary and the repository's established terminology.
  Define a necessary unfamiliar term at its first use.
- Make structure do work: use headings, lists, tables, and examples only when
  they improve scanning or comprehension. Use diagrams only when they explain
  relationships more clearly than prose, including in code comments.
- Use examples that are accurate, minimal, and representative. Keep commands
  copyable and label placeholders clearly.
- Write UI copy that tells people what will happen. Prefer specific action
  labels and useful errors over cleverness or apology.
- Write comments only to preserve non-obvious intent, constraints, or
  tradeoffs. Do not restate code.
- Follow the repository's documentation format, capitalization, link, and
  Markdown-lint rules. Use applicable formatting and lint tools in check-only
  mode for reviews; apply fixes only in an editing task.
- Use emoji only when the audience and existing style clearly call for it; never
  use it as a substitute for meaning.

## Final Checks

- Check for repetition, placeholders, and unsupported claims. Remove them when
  editing; report actionable issues when reviewing.
- Confirm that links, commands, names, and examples are accurate in context.
