# Retro — Slice 4a: Faction Membership

**Date:** 2026-06-04T22:24
**Session slug:** slice-4a-faction-membership
**Plan mode used:** Yes — plan then interactive
**Retro triggered:** Automatically (before task_complete)

## Original Prompts

> Is slice 4 a bit big? we could split it into 2 deliverables - faction memberships, and then damage/healing constraints

---

## What Went Well

| #   | What                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | User correctly identified the seam — 4a (Character BC) and 4b (Combat BC) are genuinely different bounded contexts |
| 2   | Rubber duck ran before implementation and caught three material issues                                             |
| 3   | Constructor normalisation (`factions ⊆ factionHistory`) prevents impossible states from being constructed          |
| 4   | 56 tests, all green, clean CI on first PR                                                                          |
| 5   | `leaveFaction` no-op (rubber duck recommendation) — idempotent API consistent with `joinFaction`                   |

---

## Friction / What Could Be Better

| #   | Friction                                                                   | Root cause                                                                | Process fix                                                                                                              |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | `max-params` lint warning on 5-param constructor — needed `eslint-disable` | ESLint `max-params` rule set to 4; Character now has 5 constructor params | For the kata, the 5-param pattern is acceptable. Long term: consider a config/builder object. Noted in plan for Slice 6. |
| 2   | GitHub API connectivity blip on first `gh pr checks` call                  | Transient network issue                                                   | Retry pattern (wait + retry) already in workflow — no fix needed                                                         |

---

## Design Decisions Made

| Decision                                                             | Rationale                                                                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `factions` and `factionHistory` as `readonly string[]`               | Consistent with existing immutable ctor-param pattern; sufficient for kata; simpler than `Set<string>`               |
| Constructor auto-unions `factions` into `factionHistory`             | Prevents impossible states; callers can't construct `{ factions: ['A'], factionHistory: [] }`                        |
| Faction IDs case-sensitive, no normalisation beyond empty/whitespace | Caller's responsibility; keeps engine simple; easy to add normalisation later without breaking changes               |
| `factionHistory` only grows; never touched by `leaveFaction`         | Matches spec: "ever been part of" — history is permanent. Used only by Changing Level (Slice 6), not by ally checks. |

---

## Rubber Duck Changes Applied

| Finding                                         | Action                                                   |
| ----------------------------------------------- | -------------------------------------------------------- |
| `allyHeal` instead of breaking `heal` change    | ✅ Plan updated — `heal` unchanged, `allyHeal` new in 4b |
| Constructor dedup + `factions ⊆ factionHistory` | ✅ Implemented in constructor                            |
| Faction ID validation                           | ✅ `joinFaction` rejects empty/whitespace                |
| `leaveFaction` no-op                            | ✅ Implemented                                           |
| Ally checks use `factions` only                 | ✅ Noted in code comments and test coverage plan for 4b  |
| Stable `characterId`                            | ❌ Deferred — kata scope; `===` is documented convention |

---

## MCP Tool Assessment

No new MCP recommendations.

---

## Outcome

- `Character.factions` + `Character.factionHistory` ✅
- `joinFaction` / `leaveFaction` in `src/character/` BC ✅
- 11 new tests (56 total), 100% coverage ✅
- PR #28 auto-merged ✅
- Stopping before Slice 4b per user instruction ✅
