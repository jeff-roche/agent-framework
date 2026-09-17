---
name: pull-request-conventions
description: Rules for creating or updating a GitHub pull request or GitLab merge request. Use whenever changes are prepared for review.
license: MIT
metadata:
  author: jeff-roche
  agent-framework-kind: guideline
---

# Pull Request Conventions

Treat a pull request as a review artifact, not a changelog. Follow the
repository's template and contribution rules when they exist; these rules
provide the default everywhere else.

## Rules

- Open one pull request for one coherent outcome. Do not hide unrelated work in
  a broad branch or ask reviewers to separate it themselves.
- Use the task's intended target branch, including an explicit release or
  prerequisite feature branch. Otherwise target the repository's integration
  branch. Confirm the base, source branch, and full diff before opening or
  updating the request.
- Use the repository's title format. If none exists, use an imperative,
  outcome-focused title that matches the commit subject style.
- Complete every applicable template section. Do not remove template prompts
  merely to make the description shorter.
- Explain the problem, the chosen change, and any notable tradeoffs or
  limitations. Link the tracking issue when one exists.
- Describe observable behavior, API, configuration, migration, or operational
  impact. Call out breaking changes prominently.
- List validation actually performed, including focused and full checks where
  relevant. State checks that were not run and why.
- Include screenshots, recordings, logs, or reproduction steps when they make a
  UI or behavior change easier to review. Do not add evidence that exposes
  secrets or personal data.
- Keep commits and the branch current enough for a clean merge. Resolve merge
  conflicts before requesting final review.
- Respond to review feedback with code, a clear explanation, or a deliberate
  and traceable follow-up. Do not dismiss feedback without addressing the
  underlying concern.
- Do not merge, mark ready, request reviewers, alter labels, or change the base
  branch unless the user or repository automation authorizes it.

## Final Checks

- Confirm the request URL, title, base branch, and scope are correct.
- Ensure the description includes validation, known limitations, and any
  reviewer action still needed.
