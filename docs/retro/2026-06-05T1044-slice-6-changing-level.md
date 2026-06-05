# Retro — Slice 6: Changing Level

**Date:** 2026-06-05  
**PR:** #41 (v5.0.0)  
**Stories:** 5.1, 5.2, 5.3

## Original Prompts

> Reading issue 17 - I feel like we need an external mediator for leveling up, perhaps it needs to
> subscribe to events from the combat component so that it can track damage and faction events, and
> apply the level modifier to the characters when conditions are met?

---

## What went well

- **Rubber duck caught the hidden-state design flaw before a line was written.** The first plan
  proposed a `LevelEngine` class with an internal `Map<characterId, Set<factionName>>` for faction
  history. Rubber duck correctly identified this as a blocking issue: hidden in-memory state,
  engine-instance-dependent, not portable, breaks determinism. The fix was clear: move faction
  history onto `Character`.

- **User preference for pure functions led to the simplest design.** After the rubber duck critique,
  the user expressed concern about "state being manipulated by different actors". This prompted a
  second design iteration that eliminated the class entirely, leaving just `applyLevelUp`,
  `damageThreshold`, and `factionThreshold` as pure functions in `src/level/`. Zero state risk.

- **Spec conflict caught during planning.** Issue #17 described an escalating faction threshold
  (N×3 per level), but `user-stories.md` says flat 3 per level. Catching this before TDD saved
  implementing and then re-doing the wrong formula. Issue #17 was corrected.

- **Breaking change was the right call.** `joinFaction` returning `[Character, Faction]` is the
  cleanest API once faction history must travel with the character. The alternative (caller-managed
  Map) would have been worse. Semantic versioning communicated the break clearly (v4.x → v5.0.0).

- **Cascade via while loop is correct and simple.** A single event (large damage hit or many
  factions joined) can cross multiple thresholds. The while loop handles this generically without
  special cases.

---

## What was painful

- **Integration test bugs from killed characters.** Two integration tests expected a character to
  level up after surviving exactly 1000 damage — but 500+500 kills a character with 1000 health.
  Level-up requires surviving damage, so the character must be alive after each hit. Fix: add a
  `heal` call between hits (mimicking multi-battle recovery). The spec even says "this may be
  counted over several battles" — this was a reminder to read the spec carefully when writing tests.

- **Regex-based call site migration is fragile.** Using PowerShell regex to update all
  `joinFaction` call sites was convenient but left one chained call (`joinFaction(b, joinFaction(a, ...))`)
  un-fixed because the inner call still returned a tuple. Manual review caught it. Lesson: after
  automated migration, verify with `npm test` immediately and inspect any failures for structural
  issues, not just content issues.

---

## What to carry forward

- **Faction history on Character = correct home for cumulative state.** `damageSurvived` and
  `factionsEverJoined` are both append-only counters that define the character's progression
  trajectory. They belong on the character because they are character attributes.

- **When the spec says "may be counted over several battles", tests must use heal.** Characters need
  to be alive at each check-point for level-up to fire. Write integration tests with heal calls
  between damage phases when simulating multi-battle progression.

- **Escalating vs flat thresholds: always check the user story, not the issue.** Issues can drift
  from the user story during refinement. User stories are the authoritative spec.

---

## Architecture notes

- `src/level/` is a pure BC: no constructors, no classes, no state. All three exports are pure
  functions with deterministic, transparent inputs and outputs.
- `applyLevelUp` can be composed after any operation that modifies a Character —
  `dealDamage`, `joinFaction`, or even `healFromObject` (if future rules tied healing to level).
- The two paths (damage, factions) are truly independent — either alone is sufficient for level-up.
  TDD revealed no reason to combine them additively.
