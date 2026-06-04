# RPG Combat Engine — Feature Development Plan

## Context

Sprint Zero is complete. The CD pipeline (CI, release, branch protection, conventional commits, 90% coverage gate) is green and proven. All feature work follows the rules of engagement below.

## Rules of Engagement

1. **Thin vertical slices** — every PR delivers value and is complete end to end. No scaffolding-only commits.
2. **CD techniques**:
   - NoOp implementations — wire the hook, make it a no-op, activate in a later slice
   - Guards at API entrypoints — validate preconditions before state changes
   - Progressive enhancement — extend behaviour without breaking existing tests
   - Feature switches — for risky behavioural changes (level modifiers, faction ally rules)
3. **Green means go** — tests must give confidence the release is safe to deploy. 90% coverage enforced from the first real code commit.
4. **Design emerges from TDD** — do not speculate on API shape; let tests define the interface.

---

## User Story Map

```
Slice 1: Character Creation        ← ✅ DONE (v2.0.0)
  └─ Slice 2: Damage + Self-Heal
        ├─ Slice 3: Level Effects
        ├─ Slice 4: Factions
        ├─ Slice 5: Magical Objects (parallelisable with 3 & 4)
        └─ (3 + 4) ─ Slice 6: Changing Level
```

---

## Slice 1 — Character Creation

**Stories:** 1.1 (Health, Alive), 2.1 partial (Level=1)

**Deliverable:** A `Character` can be created with `health=1000`, `alive=true`, `level=1`.

**Why Level=1 now:** The spec is explicit ("All characters have a Level, starting at 1"). Retrofitting Level after the type is published is a breaking API change.

**CD approach:** TDD from scratch. The export shape (`Character` type, factory, or class) is determined by the first test. Coverage gate is live from this slice.

**No hidden complexity** — this is the unambiguous foundation.

---

## Slice 2 — Damage + Self-Heal

**Stories:** 1.2 (Damage), 1.3 (Self-Heal)

**Deliverable:** Characters can deal damage to each other and heal themselves.

**Guards (entrypoint validation):**

- Cannot deal damage to self (identity check — design decision emerges from test)
- Health floor = 0 (never negative)
- Dead characters cannot heal
- Health ceiling = character's current max (respect cap even before levels are implemented)

**Hidden NFRs to build now (cheap vs retrofit):**

- `damageSurvived` counter on Character — required by Changing Level (5.1) to track cumulative survival across battles. Adding it after slice 3+ forces a breaking change.

**Progressive enhancement:**

- Level damage modifier (2.2) is wired as `×1.0` NoOp — activated in Slice 3

---

## Slice 3 — Level Effects

**Stories:** 2.1 complete (health cap), 2.2 (damage modifier)

**Deliverable:** Health cap raises to 1500 at level 6+. Damage is modified ±50% based on level difference.

**Depends on:** Slice 2

---

## Slice 4 — Factions

**Stories:** 3.1 (membership), 3.2 (join/leave), 3.3 (ally rules)

**Deliverable:** Characters can join/leave factions. Allies cannot damage each other; allies can heal each other.

**Hidden NFR:** Faction **history** (the cumulative set of factions ever joined — not just current) must be tracked here. Required by Changing Level (5.2). Cheaper to capture in the join/leave events now than to retrofit.

**Design seam:** The interaction between self-heal (1.3) and ally-heal (3.3) emerges during TDD here. No up-front decision needed.

**Depends on:** Slice 2

---

## Slice 5 — Magical Objects

**Stories:** 4.1 (object health, destroyed), 4.2 (healing object), 4.3 (magical weapon)

**Deliverable:** Healing objects restore character health. Weapons deal fixed damage and degrade on use (health −1 per use, destroyed at 0).

**Parallelisable** with Slices 3 and 4 — no faction or level dependency.

**Depends on:** Slice 2

---

## Slice 6 — Changing Level

**Stories:** 5.1 (level from damage survival), 5.2 (level from factions), 5.3 (level cap = 10)

**Deliverable:** Characters gain levels via two independent mechanisms; levels are capped at 10 and never lost.

**Preconditions (from earlier slices):**

- `damageSurvived` counter (Slice 2) — cumulative across battles, resets threshold per level
- Faction history (Slice 4) — cumulative distinct factions ever joined

**Complexity notes:**

- Level-up is atomic: occurs _after_ damage resolves, only if character is still alive
- Thresholds: Level N requires surviving N×1000 additional damage points; N×3 additional distinct factions

**Depends on:** Slices 3 + 4

---

## Deferred Design Decisions

| Decision                        | Deferred to | Reason                                                                    |
| ------------------------------- | ----------- | ------------------------------------------------------------------------- |
| Self-heal amount                | Slice 2 TDD | Emerges from tests; no up-front spec                                      |
| Self-heal vs ally-heal conflict | Slice 4 TDD | Seam is clean; resolved by the test that covers both rules                |
| Character identity pattern      | Slice 2 TDD | Reference equality, UUID, or other — determined by first self-damage test |
