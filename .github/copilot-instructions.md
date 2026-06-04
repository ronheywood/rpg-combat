# Behavioral guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Communication

**Be terse**

1. Bullets over paragraphs
2. Code only, no explanation unless asked
3. If you must explain, be concise. Assume the user can ask follow-ups.

## 2. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 3. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 4. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 5. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 6. Environment: Windows PowerShell

This project runs on **Windows with PowerShell**. Bash-only syntax will fail.

- **No heredocs:** `<<<` is not valid in PowerShell. To pipe multi-line content to a command, write to a temp file:
  ```powershell
  $json | Set-Content -Path $tmpFile -Encoding UTF8
  gh api ... --input $tmpFile
  Remove-Item $tmpFile
  ```
- Use `New-Item -ItemType Directory -Force` not `mkdir -p`.
- Use `$env:VAR` not `$VAR` for environment variable access in scripts.

## 7. GitHub Repository Pre-flight

Before starting implementation on a GitHub repo, verify:

```powershell
gh api repos/{owner}/{repo} --jq '{has_issues, allow_squash_merge, allow_merge_commit, allow_rebase_merge}'
```

Common issues to fix before starting work:

- **Issues disabled:** `gh api repos/{owner}/{repo} -X PATCH -f has_issues=true`
- **Wrong merge strategy:** patch `allow_squash_merge`, `allow_rebase_merge`, `allow_merge_commit` as needed.

Use the `repo-preflight` skill for a full check.

## 8. npm Package Setup Rules

When setting up an npm package for publish:

- **Remove `"private": true`** from `package.json` — it silently prevents `semantic-release` and `npm publish` from running.
- **Do not use env var syntax in `package.json`** — `"${NPM_REGISTRY_URL}"` does not interpolate. Use a literal URL in `publishConfig.registry`; the registry is overridden at runtime via `NPM_CONFIG_REGISTRY` env var or `setup-node registry-url` in CI.
- **Add `publishConfig.registry`** pointing to the target registry.

## 9. TypeScript Project Bootstrapping

When starting a new TypeScript project:

- **Create `src/index.ts` early** — `tsc --noEmit` throws `TS18003: No inputs were found` when `src/` is empty.
- **Add `passWithNoTests: true`** to `vitest.config.ts` — Vitest exits code 1 with no test files, which breaks CI on a fresh project.

## 10. Formatting

**Always run `npm run format:fix` after creating new config, YAML, or Markdown files** — Prettier's defaults differ from the project config. Failing to do this causes `npm run format` to fail in CI.

## 11. Commitlint Footer Rules

This project enforces `footer-max-line-length: 100`.

- **Each `Closes #N` or `Refs #N` must be on its own line** — never comma-separated:

  ```
  # ✅ correct
  Closes #1
  Closes #2
  Closes #3

  # ❌ rejected by commitlint
  Closes #1, Closes #2, Closes #3
  ```

## 12. GitHub Actions SHA Pinning

To get the commit SHA for an action tag:

```powershell
gh api repos/actions/checkout/git/refs/tags/v4 --jq '.object | {type, sha}'
```

If `type` is `"commit"`, the SHA is ready to use. If `type` is `"tag"` (annotated), follow up:

```powershell
gh api repos/actions/checkout/git/tags/{sha} --jq '.object.sha'
```

## 13. Respecting User Pause Requests

**Explicit pause phrases must halt autonomous progress immediately**, even in autopilot mode.

Examples: _"before committing"_, _"hold on"_, _"wait"_, _"let's review first"_

Do not push, commit, or deploy when the user has asked to pause. Park at "ready to commit/push — awaiting your go-ahead."
