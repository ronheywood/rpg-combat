# Retro: Feature Planning Session

**Date:** 2026-06-04T22:00  
**Session slug:** feature-planning  
**Plan mode used:** Yes — `[[PLAN]]` marker used; `exit_plan_mode` was called to present the plan for approval  
**Retro triggered:** Automatically — run before completing per §14

## Original Prompts

> [[PLAN]] If you're confident with the Sprint Zero outcomes, then we need to prepare for feature development.
> We should define some rules of engagement.
>
> 1. Thin vertical slices - all changes should deliver value, and be complete end to end.
> 2. Use Continuous Delivery techniques like NoOp implementations, guards in API entrypoints, Per Environment features and feature switches, and progressive enhancement
> 3. Tests should give confidence that the release is safe to deploy - Green means go
>
> There is a document - User Stories, we should review these against the above desiderata - which are ready now, which might have preconditions, and hidden non functional requirements?

> Please document the plan and then do a retro

## Session Summary

Reviewed six user stories sections against CD rules of engagement. Identified a dependency graph of six thin vertical slices, hidden NFRs per slice, and deferred design decisions. Created `docs/development-plan.md` and GitHub Issues for each slice. Ran retro.

---

## Friction Points

| #   | What happened                                                                                                                        | Root cause                                                                                                    | Category            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | Dove too deep on spec ambiguities (self-heal amount, faction-vs-self-heal) before identifying the simple seam                        | Analysis-first habit; skipped the "find simplest deliverable" step                                            | Over-analysis       |
| 2   | User had to explicitly ask to "document the plan" — plan existed only in session state                                               | Plan was built in `plan.md` but not committed to the repo; no instruction to commit plans                     | Missing step        |
| 3   | GitHub Issues not created for feature slices, despite `.github/github-issues.instructions.md` saying to use Issues for task tracking | The instruction was written for CD setup; not applied to feature planning                                     | Missing instruction |
| 4   | Structured question form asked about self-heal/faction before finding the right starting seam                                        | Should have identified the simplest unambiguous story first, _then_ looked for ambiguities in that story only | Wrong order         |

---

## Actions Taken

| Friction | Artefact                              | Change                                                                                |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| #1, #4   | `.github/copilot-instructions.md` §17 | Before analysing ambiguities: identify the simplest unambiguous deliverable first     |
| #2       | `docs/development-plan.md`            | Plan committed to repo on this branch                                                 |
| #3       | GitHub Issues                         | Created issues #12–#17 for slices 1–6 with descriptions and `Blocked by` dependencies |
| #3       | `.github/copilot-instructions.md` §17 | When creating a feature plan, create GitHub Issues for all slices                     |

---

## MCP Tool Assessment

| Category               | Friction                                                                                      | Recommendation                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| GitHub Issues creation | Creating 6 issues required 6 separate `gh issue create` calls, error-prone without a template | `@modelcontextprotocol/server-github` would allow batch issue creation more reliably |

---

## Outcome

- `docs/development-plan.md` committed ✅
- GitHub Issues #12–#17 created for slices 1–6 ✅
- Copilot instructions updated with §17 ✅
- Retro log committed ✅
