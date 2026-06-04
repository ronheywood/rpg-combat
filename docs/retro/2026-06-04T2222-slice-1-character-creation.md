# Retro: Slice 1 — Character Creation

**Date:** 2026-06-04T22:22  
**Session slug:** slice-1-character-creation  
**Plan mode used:** Yes — `[[PLAN]]` marker used; plan was revised once based on user feedback  
**Retro triggered:** Automatically — run before task completion per §14

## Original Prompts

> [[PLAN]] Let's investigate https://github.com/ronheywood/rpg-combat/issues/12 - how can we deliver this?

User feedback on first plan attempt:

> I like Clean code - Character seems like a namespace - might be decoupled from Magical Items but incorporate factions. We can use a bridge for cross cutting concerns like Damage if we design this properly now. Let's try to create logical sections for Bounded Contexts

## Session Summary

Planned and implemented Slice 1 (Issue #12): Character Creation using TDD. First plan proposed a flat file structure; user redirected to a bounded-context architecture. Revised plan approved. Three tests written first (red), then `createCharacter()` factory implemented (green). All checks passed, 100% coverage, PR #19 auto-merged, `v1.1.0` released.

---

## Friction Points

| #   | What happened                                                                        | Root cause                                                                                                                                 | Category                        |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| 1   | First plan proposed flat `src/character.ts` structure                                | No up-front consideration of bounded context/DDD boundaries; spec analysis was purely functional                                           | Missing design thinking         |
| 2   | `gh pr merge --auto --rebase --repo ronheywood/rpg-combat` fails without a PR number | `--repo` flag changes argument handling; PR number is required. Same issue as a previous session.                                          | Repeated error                  |
| 3   | `npm run checks` does not include coverage                                           | The `checks` script runs `npm test` (no coverage); coverage only runs in CI. A locally clean `checks` can still fail CI if coverage drops. | Missing local gate              |
| 4   | `gh pr create` warned "4 uncommitted changes"                                        | Branch was created before a concurrent PR (#18) fully merged into main; `format:fix` had touched files not yet in branch                   | Race condition in branch timing |

| 5 | Used `Start-Sleep -Seconds 70` to wait for CI | No instruction for a deterministic CI wait; `Start-Sleep` is a blunt instrument that sometimes under- or over-waits | Missing instruction |

| Friction | Artefact                              | Change                                                                                  |
| -------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| #1       | `docs/development-plan.md`            | Updated Slice 1 section with bounded context map; structure already committed           |
| #2       | `.github/copilot-instructions.md` §16 | Added note: always provide PR number with `gh pr merge --repo`                          |
| #3       | `.github/copilot-instructions.md` §16 | Added note: run `npm run coverage` before pushing — `checks` script does not include it |
| #4       | (no action)                           | Acceptable race; `gh pr create` still succeeds; warning is cosmetic                     |

| #5 | `.github/copilot-instructions.md` §16 | Added: use `gh pr checks <number> --watch --repo ronheywood/rpg-combat` — blocks until all checks complete, exits non-zero on failure |

---

## MCP Tool Assessment

No new MCP recommendations — existing `gh` CLI is sufficient. Friction #2 is a known CLI quirk, not a tooling gap.

---

## Outcome

- Character bounded context: `src/character/` ✅
- 3 tests: health=1000, alive=true, level=1 ✅
- 100% coverage ✅
- PR #19 auto-merged ✅
- `v1.1.0` published to GitHub Packages ✅
