# Retro — Slice 2: Damage and Self-Heal

**Date:** 2026-06-04T21:47
**Session slug:** slice-2-damage-and-heal
**Plan mode used:** No — Autopilot
**Retro triggered:** Automatically (before task_complete)

## Original Prompts

> I need you to review the codebase and set the enviroment up to succeed in a continuous devlivery environment using trunk based development.

> Let's investigate https://github.com/ronheywood/rpg-combat/issues/12 - how can we deliver this?

> pause after this slice please, before moving onto slice 3

---

## What Went Well

| # | What |
|---|------|
| 1 | Rubber duck ran **before** implementation — plan changed significantly as a result |
| 2 | Three blocking design flaws caught before a single line of prod code was written |
| 3 | 19 tests, 100% coverage, all checks green on first PR |
| 4 | `gh pr checks --watch` pattern worked cleanly — no sleep polling |

---

## Friction / What Could Be Better

| # | Friction | Root cause | Process fix |
|---|---|---|---|
| 1 | `damageSurvived` was initially in the plan — would have locked Slice 6 API prematurely | Plan followed development-plan.md note verbatim without questioning it against thin-slice rules | Rubber duck challenge: "does this belong in this slice?" |
| 2 | Health cap `level >= 6 ? 1500 : 1000` was initially in the plan — Slice 3 owns that story | Trying to be clever / anticipate future; violated thin-slice rule | Only implement rules that are in scope for **this** slice |
| 3 | `levelModifier = 1.0` NoOp was planned — rubber duck correctly called it speculative | Over-engineering from CD "wire NoOp seams early" heuristic | CD seams are useful for **guards at API entrypoints**, not for invisible constant multipliers |
| 4 | CRLF noise on `git status` continues to require `git restore .` before every `git pull` | Windows + LF files in repo; `core.autocrlf` not set | Set `core.autocrlf=input` on this machine OR add `.gitattributes` to the repo |

---

## Design Decisions Made

| Decision | Rationale |
|---|---|
| `dealDamage` identity check uses `===` (instance equality) | Documented explicitly as "same instance = self" — test #7 proves different-instance same-stats is **not** blocked. Factional ally rules (Slice 4) will layer on top of this. |
| Health cap = 1000 hardcoded | Level-based cap (1000/1500) is Slice 3's story — premature to wire here |
| `damageSurvived` deferred to Slice 6 | Leveling semantics not yet decided; retrofitting is a minor non-breaking addition |
| Dead target can be damaged | Harmless degenerate case — spec doesn't prohibit it |
| Amount guards reject negative + non-finite | Negative damage = heal is a real bug; NaN corrupts health; both caught at entry |

---

## Process Fix #4 — CRLF noise

The repeated `git restore .` dance wastes a step on every branch switch. Fix:

```bash
# Option A — per-repo (recommended, add .gitattributes)
# .gitattributes:
* text=auto eol=lf

# Option B — global machine setting
git config --global core.autocrlf input
```

Adding `.gitattributes` to the repo is the correct fix — it normalises line endings for all contributors without requiring machine config.

---

## MCP Tool Assessment

No new MCP recommendations. The rubber duck agent is now the highest-value tool in the flow — running it before implementation prevented at least one v3.0.0 breaking change.

---

## Outcome

- `src/combat/combat.ts` — `dealDamage`, `heal` ✅
- 19 new tests, 26 total, 100% coverage ✅
- `src/index.ts` re-exports combat BC ✅
- PR #23 auto-merged ✅
- Pausing before Slice 3 per user instruction ✅
