---
name: phone-a-friend
description: Escalate a consequential uncertainty to the right person, agent, or approved service. Use when evidence cannot resolve a decision safely.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Phone a Friend

Escalate only a decision that materially affects correctness, safety, cost, or
scope. Do not ask for help before checking available repository evidence.

## Inputs

- The unresolved decision, affected task, evidence checked, and known constraints.
- Available contacts or tools and any limits on delegation or external access.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `write-like-a-human`.

## Procedure

1. State the decision that blocks progress and the consequence of choosing
   incorrectly.
2. Gather the smallest set of evidence that could resolve it: requirements,
   repository guidance, code, tests, logs, documentation, and prior decisions.
3. Decide whether the unresolved question needs a user decision, specialist
   review, another agent's investigation, or an approved external source.
   Use only contacts and delegation tools permitted by the caller and environment.
4. Formulate one bounded question. Include the relevant evidence, viable
   options, tradeoffs, recommendation, and the decision needed.
5. Do not expose secrets, private data, proprietary code, or internal URLs to
   an external service. Use external services only when allowed by the task and
   environment.
6. Record the answer and its source. Check technical advice against repository
   evidence before recommending it. Separate advice from a decision or approval
   that only the user or another authorized owner can give.
7. Return the resolved decision to the caller. If no answer is available, suggest
   a reversible fallback only within the task's existing authority; otherwise
   report the blocker. Do not substitute a fallback for required approval.

## Output

- Produce a decision request with the question, evidence, options,
  recommendation, and impact of delay.
- After an answer, report the decision, source, and next action.
- Note whether technical advice was verified and what uncertainty remains.
- If blocked, report exactly what information or authorization is required.
