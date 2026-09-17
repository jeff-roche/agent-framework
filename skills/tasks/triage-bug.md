---
name: triage-bug
description: Produce an evidence-based bug triage record with a reproduction, impact, suspected cause, and next action. Use for bug reports, failures, and regressions.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Triage Bug

Turn a bug report into an evidence-based, prioritized next action. This task is
diagnostic: return a proposed fix or investigation step without applying a fix
or changing issue state.

## Inputs

- Bug report or observed failure, expected behavior, and available environment details.
- Relevant logs, reproduction steps, recent changes, and any prior investigation.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `write-like-a-human`.

## Procedure

1. Capture the reported and expected behavior, affected users or systems,
   environment, version, frequency, timestamps, logs, and recent changes.
2. Classify the impact and urgency. Check for data loss, security exposure,
   outage risk, corruption, or a viable workaround before deeper investigation.
3. Reproduce the failure with the smallest reliable steps. Record the command,
   input, environment, actual result, and expected result. State clearly when
   reproduction fails.
4. Narrow the failure boundary through logs, tests, configuration, code paths,
   and recent changes. Use a regression range or bisection only when it is
   likely to reduce uncertainty materially.
5. State the suspected root cause and confidence level. Separate evidence from
   hypotheses; do not present correlation as proof.
6. Recommend the next action: a bounded fix, a specific evidence-gathering step,
   or an ownership or product decision. Failed reproduction alone is not grounds
   to recommend closure; state what environment or evidence is still missing.

## Output

- Produce a triage record with impact, severity, reproduction status and steps,
  evidence, suspected cause and confidence, workaround, and next action.
- Mark unknown fields as unknown; do not infer missing facts.
