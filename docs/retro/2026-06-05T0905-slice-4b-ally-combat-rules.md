# Retro — Slice 4b: Ally Combat Rules

**Date:** 2026-06-05T09:05
**Session slug:** slice-4b-ally-combat-rules
**Plan mode used:** No — interactive
**Retro triggered:** Before task_complete (§14)

## Original Prompts

> TI noticed that there's no github issue for slice 4b - we didn't split the issue correctly.
> Please create the github issue, then proceed with implementation

---

## What Went Well

| #   | What                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Rubber duck ran BEFORE implementation (§14a applied) — caught two material guard-order issues                   |
| 2   | Adversarial review of the refactor (PR #33) resolved `areAllies` self-alias and snapshot contract bugs first    |
| 3   | Guard order decision (self → amount → ally) locks programmer-error detection before business-rule checks        |
| 4   | Explicit self guard on `allyHeal` with dedicated error message — avoids misleading "not allies" for self-target |
| 5   | Private `applyHeal` extracts shared cap logic — `heal` and `allyHeal` cannot drift on `maxHealth` ceiling       |
| 6   | `dealDamage` backward compat preserved — no existing tests needed updating                                      |
| 7   | 85 tests, 100% coverage, CI green on first PR                                                                   |
| 8   | GitHub issue #34 created before implementation — slice properly tracked                                         |

---

## Friction / What Could Be Better

| #   | Friction                                                                    | Root cause                                                                    | Process fix                                                                              |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | GitHub issue #34 was missing — the 4a/4b split was done without creating it | Issue #15 was closed as the original Slice 4, but the split was never tracked | When splitting a slice, always create new issues for each sub-slice before starting work |
| 2   | Dynamic import (`await import(...)`) was accidentally written in one test   | Habit from async contexts; caught by linter/typecheck before PR               | Static imports only in test files — TS will catch this                                   |

---

## Design Decisions Made

| Decision                                                              | Rationale                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `dealDamage` takes `factions?` (optional)                             | Backward compat with all existing tests; lone wolf semantics correct — no factions = no ally rules            |
| Guard order: self → amount → ally in `dealDamage`                     | Rubber duck: validates programmer errors (amount) before business rules (ally) so errors are unambiguous      |
| Guard order: self → amount → healer alive → target alive → ally       | Amount is cheapest check; alive guards before relationship check; fails fast with clearest message            |
| Self-heal stays on `heal()`, self-target `allyHeal` is explicit error | `areAllies(a,a)` returns false, but relying on that gives misleading "not allies" message; explicit is better |
| `applyHeal` private helper shared by `heal` and `allyHeal`            | DRY — one path for health cap logic; `maxHealth` ceiling cannot drift between self and ally healing           |
| `allyHeal` in combat BC (not character BC)                            | It's an interaction rule between characters, not intrinsic character state — matches bounded context design   |

---

## Rubber Duck Changes Applied

| Finding                                          | Action                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Guard order: amount before ally check            | ✅ Changed to self → amount → ally in both `dealDamage` and `allyHeal`              |
| `factions?` optional makes rules bypassable      | Partial — kept optional for backward compat/lone wolf; documented contract in tests |
| Self-target `allyHeal` gives wrong error         | ✅ Added explicit self guard with dedicated message                                 |
| Extract shared heal path                         | ✅ Private `applyHeal` added                                                        |
| `allyHeal` belongs in combat BC                  | ✅ Already the plan                                                                 |
| Missing tests (self-target, guard order, barrel) | ✅ All added                                                                        |

---

## Outcome

- `dealDamage(attacker, target, amount, factions?)` — ally guard ✅
- `allyHeal(healer, target, amount, factions)` — ally healing with full guards ✅
- `heal()` unchanged ✅
- GitHub issue #34 created and closed ✅
- 19 new tests (85 total), 100% coverage ✅
- PR #35 auto-merged ✅
- Pausing before Slice 5 per user instruction ✅
