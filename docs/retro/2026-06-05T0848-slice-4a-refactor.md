# Retro — Slice 4a: Faction Entity Refactor

**Date:** 2026-06-05T08:48
**Session slug:** slice-4a-refactor
**Plan mode used:** No — interactive
**Retro triggered:** User request

## Original Prompts

> Ok quick design review. We've introduced factions - 1 faction has 0-many characters. Characters
> invoke a Join or Leave action on the faction. Characters exist independently of factions, and
> initially have no faction. (Can a character leave a faction without joining another? Revert to a
> "lone wolf") If factions were mandatory then faction would become the mediator for damage and
> healing effects, but the lone wolf character complicates things slightly.
>
> You've commented on the dependencies for the character constructor, and the linter has also warned
> us about this cyclometric complexity. The contract must be wrong then. We should simplify before we
> add more behavior

---

## What Went Well

| #   | What                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------ |
| 1   | Linter signal (`max-params`) was the right clue — the smell was real, not a false positive             |
| 2   | User's domain framing was clear: "1 faction has 0-many characters" → Faction is the aggregate root     |
| 3   | Refactor was surgical — Character went from 5 params back to 4, and `eslint-disable` was removed       |
| 4   | `Character.id` (stable UUID) replaced embedded faction strings — cleaner, also fixed self-damage guard |
| 5   | `joinFaction`/`leaveFaction` now return `Faction` — aligns with "characters invoke actions on faction" |
| 6   | `factionHistory` deliberately deferred to Slice 6 — no speculative complexity added                    |
| 7   | 62 tests, 100% coverage, CI green, PR #30 merged first try                                             |

---

## Friction / What Could Be Better

| #   | Friction                                                                       | Root cause                                                                                                    | Process fix                                                                                               |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Slice 4a (original) embedded faction data on `Character` — required a refactor | No aggregate root analysis before designing the first 4a; rubber duck focused on `allyHeal` and deduplication | When a new entity appears, explicitly ask: who owns whom? Run a brief aggregate root check at design time |
| 2   | `joinFaction` returned `Character` in v1.4.0 — semantically backwards          | The initial mental model treated Character as the subject; domain language said Faction should be the subject | Use the domain sentence "Character invokes action on Faction" as a return-type smell test                 |
| 3   | Rubber duck was not consulted before this refactor                             | Refactor felt small/obvious so the step was skipped                                                           | Even small refactors touching multiple files benefit from a rubber duck pass — apply §14a consistently    |

---

## Design Decisions Made

| Decision                                                           | Rationale                                                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `Faction(name, memberIds)` — Faction entity owns members by ID     | Faction is the aggregate root; Character holds no faction state; clean separation of concerns       |
| `joinFaction(character, faction): Faction`                         | Character is the actor, Faction is the subject — matches domain language and removes circular dep   |
| `Character.id = crypto.randomUUID()` — 4th ctor param with default | Stable identity across immutable copies; also enables `attacker.id === target.id` self-damage guard |
| `areAllies(a, b, factions): boolean` in character BC               | Belongs to character BC, not combat — combat bridge calls it in Slice 4b                            |
| `factionHistory` deferred to Slice 6                               | Not needed for ally combat rules (Slice 4b); avoids speculative design until the story is ready     |

---

## Rubber Duck Assessment

Rubber duck was **not** consulted for this refactor (§14a skipped). No issues emerged in CI, but the
absence of the review means we may have missed edge cases in the new `Faction` entity design.
Applying consistently in Slice 4b.

---

## Outcome

- `Faction` as proper entity with `memberIds`, `joinFaction`, `leaveFaction`, `areAllies` ✅
- `Character.id` stable UUID, preserved across immutable copies ✅
- `Character` back to 4 constructor params, no `eslint-disable` ✅
- `factionHistory` deferred — lone wolf character explicitly supported ✅
- 62 tests, 100% coverage ✅
- PR #30 auto-merged → `v3.0.0` (BREAKING CHANGE) ✅
- Pausing before Slice 4b per user instruction ✅
