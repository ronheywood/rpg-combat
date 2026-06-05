# Retro — Slice 5: Magical Objects

**Date:** 2026-06-05  
**PR:** #39  
**Stories:** 4.1, 4.2, 4.3

## Original Prompts

> Ok plan slice 5, and hand off to the rubber duck

---

## What went well

- **Rubber duck before implementation caught real design errors.** The first-draft plan used
  inheritance (`MagicalObject` base class), tuple returns, and a `Damageable` interface. The rubber
  duck flagged all three as problematic before a single line of implementation was written. The
  revised plan was markedly better.

- **`useWeapon` as a thin wrapper was the right call.** Delegating to `dealDamage` kept the level
  modifier, ally check, damageSurvived, and self-damage guard in one place. No duplication.

- **`kind` discriminant is pragmatic.** Two independent classes with a discriminant field gives full
  TypeScript structural safety without the fragility of inheritance or union type gymnastics.

- **136 tests; all green on first CI run.** The objects BC, combat BC, and barrel all passed without
  any post-push fix commits.

---

## What was painful

- **File editing got into a bad state.** The initial edit of `combat.ts` accidentally used dynamic
  `await import()` inside a sync function AND left duplicate content from a failed replacement. The
  root cause was trying to append to a file that needed a full rewrite — the `edit` tool's
  old/new-string approach isn't the right tool when replacing the entire content. Using
  `Set-Content` to overwrite was the correct fix.

- **`index.test.ts` got a duplicate `describe` block** for the same reason — partial replacement
  left old content below the new content. Same fix (Set-Content).

- **Session continuity overhead.** The implementation was interrupted mid-session with a syntax
  error in tests (`_ = faction;` hack) and the implementation not yet written. Resuming required
  re-reading the summary to reconstruct state. The summary was accurate and sufficient, but it took
  a few tool calls to orient.

---

## What to carry forward

- **Full-file rewrites: use `Set-Content`, not `edit`.** When a file needs to be replaced in its
  entirety (not patched), use `Set-Content` or `powershell` to write the whole content atomically.
  `edit` is for surgical patches; it's wrong for full rewrites.

- **Red phase check matters.** Verifying 20 failing tests before implementing confirmed the test
  file was correct and the implementation gap was real. This is worth the extra `npm test` run.

- **Spec clarification table added real value.** Before coding, the plan included a 5-row table
  clarifying ambiguous spec questions (can objects be attacked? can any character use them? etc.).
  This prevented mid-implementation surprises and is worth doing for every slice with objects or
  rules interactions.

---

## Architecture notes

- The `src/objects/` BC is neutral — no faction rules, no level modifier, no character coupling.
  Objects are tools that the combat bridge (caller) threads through.
- `healFromObject` intentionally has no `factions` param. The spec is explicit: objects do not
  belong to factions.
- `useWeapon`'s `factions?` param exists because the _attacker_ is a Character — ally rules still
  apply to the attacker's relationships. The weapon itself is neutral.
