# Retro: Post-Slice 6 Code Review

**Date:** 2026-06-05  
**PRs:** #42 (retro), #43–#49  
**Version:** v5.0.0 → v6.0.1

## Original Prompts

> I don't see any code that invokes the levelEngine, other than tests? Is it redundant?

> So in this test here there's a bit of a smell in the way the test orchestrates business logic —
> if leveling up is a side effect of dealDamage then the test shouldn't be invoking it.
> Make sure there's no other examples of these test smells

> I don't see any integration test related to using magical objects either

> There's 3 healing methods in combat, I see healFromObject doesn't call applyHeal, and heal is
> actually Self Heal but doesn't provide any guard against an exploit that can bypass the factions
> checks. Can you improve these please

> These are the same function now — A lone wolf character is an ally of itself

> This test needs a lone wolf scenario — but why is a character in a faction not an ally of itself?

> No — a lone wolf with no factions Should be able to heal themselves, so a lone wolf needs to be
> an ally of themselves. We're surely missing an integration test here if all tests are passing

> Well a lone wolf certainly shouldn't be able to deal damage to themselves — so that areAllies
> guard in deal damage is still valid

> So the selfAttack guard is redundant — areAllies is the guard

> Actually — the more specific error message adds value, leave it.
> I gave you a lot of prompts since Slice 6 was completed — can you aggregate them all to do a final retro?

> We seem to have stopped recording the prompts — can you retro fit them into the existing retro documents?

---

## What We Did

After Slice 6 was delivered the user reviewed the codebase and raised a series of
observations. This session was an unplanned but productive code-review-driven
improvement cycle.

| PR  | Change                                                               |
| --- | -------------------------------------------------------------------- |
| #42 | Merged Slice 6 retro doc                                             |
| #43 | Wired `applyLevelUp` into `dealDamage` and `joinFaction`             |
| #44 | Removed redundant manual `applyLevelUp` calls from integration tests |
| #45 | Added 6 magical objects integration tests                            |
| #46 | Strengthened `heal` guard; `healFromObject` delegates to `applyHeal` |
| #47 | Merged `allyHeal` into `heal(healer, target, amount, factions?)`     |
| #48 | Fixed `areAllies` incorrect self-comparison (`false` → `true`)       |
| #49 | `areAllies(a, a)` now drives self-heal; lone wolf integration tests  |

## What Went Well

### User review caught real bugs

The level engine was exported but never called from production code — the entire
Slice 6 delivery was incomplete without anyone noticing until the user asked. The
automated tests passed because they called `applyLevelUp` manually, masking the
gap between the unit contract and the real-world call chain.

### Observations led to design improvements

Each user observation triggered a logical chain of improvements rather than
isolated patches:

- "These two functions are the same" → `allyHeal` merged into `heal`
- "Why is a character not an ally of itself?" → `areAllies` corrected, `heal`
  simplified, lone wolf scenario clarified
- "The self-attack guard is redundant now" → identified as doubly-guarded but
  the specific error message justified keeping it

### Breaking changes were small and clean

The `allyHeal` removal was a BREAKING CHANGE but every call site was a trivial
rename. The semantic model became cleaner: one function for all healing, one rule
(`areAllies`) that defines who can heal whom.

## What Could Have Been Better

### Integration tests as a safety net

The level engine wasn't wired up at delivery. Unit tests for `applyLevelUp` all
passed, and integration tests also passed — but only because the integration tests
themselves called `applyLevelUp` manually. This is a test smell that should have
been caught during the rubber duck review before PR #41 was merged.

**Improvement:** Integration tests should exercise the public API end-to-end
without orchestrating internal business logic. If a test calls a function that
isn't part of the scenario's natural flow, that's a signal something is missing
from production code.

### `allyHeal` should never have existed separately

The faction spec says "allies can heal one another" — it does not say "there is a
separate heal function for allies". Having two functions (`heal` and `allyHeal`)
with overlapping concerns violated the open/closed principle and invited confusion.
The unified `heal(healer, target, amount, factions?)` should have been the first
design.

### `areAllies` self-comparison

The `a.id === b.id → return false` guard was added defensively (likely to prevent
`dealDamage` exploits) but was placed in the wrong function. `dealDamage` already
checks identity. `areAllies` is a pure query that should answer: "do these two
characters share an alliance?" — and a character always allies with itself.

## Key Decisions

**Keep the `dealDamage` self-attack guard alongside `areAllies`.**  
Even though `areAllies(a, a)` now returns `true` (which would also block
self-damage), the explicit guard fires first and produces the more informative
error message: _"A character cannot deal damage to itself"_ vs
_"Allies cannot damage each other"_. Both are correct; the specific one wins.

**`factions` parameter on `heal` is optional.**  
A character doesn't need to pass factions to self-heal. Passing an empty array
would break nothing, but making it optional signals intent: factions are only
relevant when healer ≠ target.

## Tests

| Milestone                   | Count |
| --------------------------- | ----- |
| Slice 6 delivery (v5.0.0)   | 182   |
| After this session (v6.0.1) | 191   |

+9 net tests. The magical objects integration suite, lone wolf scenarios, and the
corrected `areAllies` self-comparison test all add meaningful coverage.
