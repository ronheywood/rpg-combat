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

## 14. Run Retro Before task_complete

**Always run the retro agent before calling `task_complete`.**

Invoke the `retro` agent (`.github/agents/retro.agent.md`) at the end of every session to log friction points and produce process improvements. The retro should be committed before the final `task_complete` call.

If autopilot completes a task without running a retro, the user is entitled to request one retroactively.

## 14a. Run Rubber Duck Before Implementation

**For every non-trivial implementation, run the rubber duck agent AFTER the plan is approved but BEFORE writing any code.**

The plan approval is the highest-leverage moment. Issues found before coding are free to fix; issues found after a release (as happened in Slice 1) require a breaking change.

Trigger: plan exits plan mode with approval → rubber duck → implement.

Skip for trivial single-file changes with no design decisions. Do not skip for:

- Any new type, class, or bounded context
- Any change to a published API surface
- Any cross-cutting concern (damage bridge, faction rules, etc.)

## 15. GitHub Packages Auth and Naming

When publishing to GitHub Packages (`https://npm.pkg.github.com`):

- **Package name must be scoped:** `@owner/package-name` — unscoped names return `404 Not Found` on publish.
- **`GITHUB_TOKEN` is sufficient for auth** in the same repo — no separate `NPM_TOKEN` secret is needed when `packages: write` is granted in the workflow `permissions` block.
  - Pattern: `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN || secrets.GITHUB_TOKEN }}`
- **Never set `NPM_CONFIG_REGISTRY` unless the secret is guaranteed non-empty** — an empty value overrides the registry set by `setup-node` / `publishConfig`.

## 16. Agent Workflow: Always Use Branches and PRs

**Never push directly to `main`.** The correct workflow is:

```powershell
# 1. Create a short-lived branch (kebab-case, prefixed with ticket or topic)
git checkout -b fix/my-change

# 2. Make changes, stage, commit (conventional commit via git-commit skill)
git add <files>
git commit -m "fix: ..."

# 3. Push branch and create PR
git push -u origin fix/my-change
gh pr create --fill

# 4. Enable auto-merge — PR merges automatically when CI passes
gh pr merge --auto --rebase
```

Rules:

- One logical change per branch
- Branch names: `fix/`, `feat/`, `chore/`, `docs/` prefix
- Delete branch after merge (repo already configured `delete_branch_on_merge: true`)
- **Never use `git push origin main`** — use PRs so the user can see and review changes
- **`gh pr merge` requires a PR number when using `--repo`**: `gh pr merge <number> --auto --rebase --repo ronheywood/rpg-combat`
- **Run `npm run coverage` before pushing** — `npm run checks` uses `npm test` (no coverage); CI will fail if coverage drops below 90% even when checks pass locally
- **Never use `Start-Sleep` to wait for CI** — use `gh pr checks <number> --watch --repo ronheywood/rpg-combat` instead. It blocks until all checks complete and exits non-zero on failure. No arbitrary sleep needed.

This applies even in autopilot mode.

## 17. Feature Planning: Simple Seam First, Then Issues

When analysing a set of user stories for planning:

1. **Find the simplest unambiguous deliverable first** — the story with no preconditions and no spec ambiguity. Start there. Do not analyse edge cases or ambiguities in stories that aren't yet in scope.
2. **Commit the plan to the repo** — write it to `docs/development-plan.md` and commit it via PR. Session-state `plan.md` is scratch; the repo document is the record.
3. **Create GitHub Issues for all slices** — per `.github/github-issues.instructions.md`, GitHub Issues is the task tracking system. Create one issue per slice with description and `Blocked by #N` dependencies before implementation begins.

```powershell
# Create a feature-planning label if needed
gh label create feature --color 0075ca --description "Feature development" --repo ronheywood/rpg-combat

# Create issues for each slice
gh issue create --title "Slice N: ..." --body "..." --label feature --repo ronheywood/rpg-combat
```

Use `--repo ronheywood/rpg-combat` on all `gh` commands — no default remote is set.
