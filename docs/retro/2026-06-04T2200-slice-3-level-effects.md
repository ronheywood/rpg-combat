# Retro — Slice 3: Level Effects

**Date:** 2026-06-04T22:00
**Session slug:** slice-3-level-effects
**Plan mode used:** Yes — plan then autopilot
**Retro triggered:** Automatically (before task_complete)

## Original Prompts

> Some feedback on the tests first - there's no test for character is alive when health is not 0 - combinatorial tests work well.
> Then I think that the next slice probably needs to progress towards simple damage, and self healing - to facilitate a component that allows levelling up

---

## What Went Well

| #   | What                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User feedback on combinatorial tests was directly acted on — added `is alive when health > 0` as a pair for `is not alive when health is 0` |
| 2   | Plan mode caught a design question before coding: "Do you need a refactor to allow characters to deal damage to other characters?"          |
| 3   | Bridge design confirmed as correct — `dealDamage(attacker, target, amount)` already had both references needed for the level modifier       |
| 4   | `damageSurvived` accepted in Slice 3 (previously deferred from Slice 2 by rubber duck) — Slice 3 owns levelling infrastructure              |
| 5   | 42 tests, 100% coverage, all checks green on first PR                                                                                       |
| 6   | No CRLF noise — `.gitattributes` from retro PR #24 is working                                                                               |

---

## Friction / What Could Be Better

| #   | Friction                                                                                                                                                                   | Root cause                                                     | Process fix                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Plan initially included `damageSurvived` in Slice 2 (from plan.md note), rubber duck correctly rejected it; now it's right in Slice 3 — the plan.md note was stale         | Plan.md carried forward from Sprint Zero without being updated | Update plan.md at the start of each slice, not just at the end |
| 2   | Test suite organisation: `character.test.ts` started as one flat `describe('createCharacter')` block; now split into three `describe` blocks to match the feature grouping | Slice 1 started simple; structure didn't evolve until Slice 3  | It's fine — TDD lets structure emerge. No process fix needed.  |

---

## Design Decisions Made

| Decision                                                                    | Rationale                                                                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `levelModifier` extracted as a private function                             | Isolates the rule; readable; easy to extend for Slice 4 (faction override)                                                           |
| `damageSurvived` uses _actual_ damage (post-modifier), not _nominal_ amount | A level-1 attacker hitting a level-6 target deals 50 not 100; the character survived 50, not 100. More accurate.                     |
| `Character.maxHealth` is a getter on Character, not a utility in combat     | It's a character attribute (spec: "A Character cannot have a health above 1000 until they reach level 6") — it belongs on the entity |
| Killing blow does not increment `damageSurvived`                            | Spec: "Characters that _survive_ X damage points gain a level" — you didn't survive it                                               |

---

## MCP Tool Assessment

No new MCP recommendations. Rubber duck ran pre-plan (user feedback served this role this session).

---

## Outcome

- `Character.maxHealth` getter ✅
- `Character.damageSurvived` tracking ✅
- `dealDamage` level modifier ±50% ✅
- `heal` uses `character.maxHealth` ✅
- 42 tests, 100% coverage ✅
- PR #25 auto-merged ✅
- Stopping before Slice 4 per user instruction ✅
