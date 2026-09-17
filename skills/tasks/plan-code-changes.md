---
name: plan-code-changes
description: Produce an implementation-ready plan for non-test code changes. Use before implementing a feature, defect fix, or review feedback that needs more than a trivial edit.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: task
---

# Plan Code Changes

Produce the smallest implementation plan that can satisfy the requested
outcome. Do not modify test or production code in this task.

## Inputs

- Requested outcome, acceptance criteria, scope, and known constraints.
- Repository context and any triage record, review findings, or existing plan.

## Required Guidelines

Load `task-conventions`, `use-repo-conventions`, and `write-like-a-human`.

## Procedure

1. Define the requested outcome, acceptance criteria, non-goals, constraints,
   and unknowns from the task and repository guidance.
2. Trace the current behavior through the relevant entry points, data flow,
   state transitions, dependencies, configuration, and error paths.
3. Identify the smallest set of files and interfaces that must change. Reuse
   existing patterns and dependencies unless they cannot meet the requirement.
4. Write the steps in implementation order. For each step, name the file or
   component, the behavior to change, and how it connects to adjacent code.
5. Call out API, schema, configuration, migration, compatibility, security,
   concurrency, performance, and operational effects when applicable.
6. Identify the test behavior and validation required for the plan. Refer to a
   separate test plan when one exists rather than duplicating it.
7. Resolve low-risk ambiguity from repository evidence. Escalate only decisions
   that materially change behavior, scope, or compatibility.

## Output

- Produce a numbered plan with file paths and concrete behavior changes.
- Include affected interfaces and validation. Add assumptions, risks, and
  non-goals only when they help bound the work.
- End with open decisions only when they block a safe implementation.
