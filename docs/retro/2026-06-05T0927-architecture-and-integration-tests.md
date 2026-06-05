# Retro — Architecture Analysis & Integration Simulations

**Date:** 2026-06-05T09:27
**Session slug:** architecture-analysis-and-integration-tests
**Plan mode used:** Yes — plan then autopilot
**Retro triggered:** Before task_complete (§14)

## Original Prompts

> Let's stop and explore the Combat component — This seems to be emerging as a state engine,
> maintaining alliances, and mediating health modifiers. Damage and Heal both seem to be modes of
> the same HealthModifier base. I am beginning to imagine scenarios and arrangements of combat.
> Do factions form as a combat "turn" when combat is initiated? And dissolve when combat ends?
> What are the implications of this design? Would it align with the coming slices? Is it aligned
> with our current implementation?

> Ok — we should document this conversation and record the constraints in the Issue for slice 6.
> Please review the integration test coverage also. We have no real world simulations.

---

## What Went Well

| #   | What                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Rubber duck adversarial review caught two errors in the initial analysis before it was published            |
| 2   | `Damageable` replaced with `useWeapon(actor, source, target)` — a materially better Slice 5 model           |
| 3   | Three hidden Slice 6 risks surfaced early: `factionHistory`, `damageSurvived` semantics, level-up ownership |
| 4   | Constraints documented in GitHub issue #17 comment — findable and actionable before Slice 6 TDD             |
| 5   | Integration tests grew from 1 to 11 — six real-world simulations now give composed-rule confidence          |
| 6   | Level modifier simulations are exact (7 hits / 30 hits) — pin the arithmetic, not just the direction        |
| 7   | All 95 tests green, CI passed on first PR                                                                   |

---

## Friction / What Could Be Better

| #   | Friction                                                              | Root cause                                                  | Process fix                                                                 |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Initial analysis had `Damageable` as the Slice 5 pivot — wrong        | Target polymorphism framing; missed actor/source split      | Rubber duck caught it; process worked as designed                           |
| 2   | `recruit = dealDamage(recruit, veteran, 100)` — wrong assignment side | `dealDamage` returns the updated target, not attacker       | Mental model check: always assign the return value to the _target_ variable |
| 3   | Rubber duck was asked AFTER writing the analysis (not BEFORE)         | Analysis felt like thinking-out-loud, not an implementation | For non-trivial design analysis, rubber duck applies too — apply §14a       |

---

## Design Decisions Made

| Decision                                                                        | Rationale                                                                                |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| No CombatSession for the kata                                                   | Spec doesn't describe it; remaining slices don't require it; functional model sufficient |
| Slice 5 pivot: `useWeapon(attacker, weapon, target, factions?)`                 | Actor/source/target separation; weapon has no level, no faction; degrades separately     |
| `damageSurvived` as lifetime counter, threshold = `level*(level+1)/2 * 1000`    | No reset needed; computable from current level; decide rename before Slice 6 TDD         |
| Level-up ownership: engine-owned preferred per spec ("directly afterwards")     | TDD will reveal exact shape; noted as design question in issue #17                       |
| `factionHistory` Option A: widen `joinFaction` to return `[Character, Faction]` | Cleanest API if breaking change is acceptable; decide at start of Slice 6                |

---

## Outcome

- Architecture analysis documented in `plan.md` ✅
- Architectural constraints recorded in GitHub issue #17 ✅
- Integration simulations: 1 → 11 tests (PR #37) ✅
- Rubber duck adversarial review of analysis ✅
- 95 tests, 100% coverage ✅
- Pausing before Slice 5 per user instruction ✅
