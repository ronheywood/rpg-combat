---
applyTo: '**'
---

# Task and Plan Tracking with GitHub Issues

This project uses **GitHub Issues** as the canonical system for tracking tasks, plans, and implementation work.

## Convention

Before starting any non-trivial implementation work:

1. **Create a GitHub Issue** for each discrete task using the `github-issues` skill.
2. **Label issues** appropriately (e.g. `enhancement`, `bug`, `cd-setup`).
3. **Link dependencies** in the issue body using "Blocked by #N" so the sequence is clear.
4. **Reference the issue** in your commit message footer: `Closes #N` or `Refs #N`.

## Why

- Issues provide a shared, persistent record of intent and decisions.
- They give reviewers context for PRs.
- They allow progress to be tracked outside of any single chat session or agent run.
- They are visible to the whole team, not just the AI agent.

## Guidance for Copilot agents

- **Always create issues before implementing.** Do not start writing code for a new feature or task without a corresponding GitHub Issue.
- Use the `github-issues` skill to create, update, and link issues.
- When a task is complete, close the issue via a commit message (`Closes #N`) or directly via the CLI.
- Do not use markdown files, SQL tables, or plan.md as the primary task tracker — those are session-local and ephemeral. GitHub Issues are the record of truth.
