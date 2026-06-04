---
name: repo-preflight
description: "Run a pre-flight health check on a GitHub repository before starting implementation work. USE FOR: checking issues enabled, branch protection, merge strategy, secrets list, and Dependabot status before any CD or infrastructure setup task. Triggers on: 'check repo', 'pre-flight', 'before we start', or any setup task on a new repository."
---

# Repository Pre-flight Health Check

Run this skill at the start of any implementation session that involves GitHub repository configuration, CI/CD setup, or branch strategy changes. It surfaces blockers before you hit them mid-implementation.

## When to Use

- Starting a new CD/infrastructure setup task
- Before creating GitHub Issues for a milestone
- When onboarding to an unfamiliar repository
- Before setting up branch protection or merge strategies

## Pre-flight Checklist

### 1. Basic Repo Info

```powershell
gh api repos/{owner}/{repo} --jq '{
  name,
  visibility,
  has_issues,
  default_branch: .default_branch,
  allow_squash_merge,
  allow_merge_commit,
  allow_rebase_merge,
  delete_branch_on_merge
}'
```

**Fix issues disabled:**

```powershell
gh api repos/{owner}/{repo} -X PATCH -f has_issues=true --jq '.has_issues'
```

**Fix merge strategy (rebase-only for trunk-based):**

```powershell
gh api repos/{owner}/{repo} -X PATCH `
  -f allow_squash_merge=false `
  -f allow_merge_commit=false `
  -f allow_rebase_merge=true `
  -f delete_branch_on_merge=true
```

### 2. Branch Protection

```powershell
gh api repos/{owner}/{repo}/branches/{branch}/protection 2>&1
```

- HTTP 404 → no protection set (action required for trunk-based dev)
- Check `required_status_checks`, `required_linear_history`, `allow_force_pushes`

### 3. Secrets

```powershell
gh secret list --repo {owner}/{repo}
```

For CD pipelines, verify required secrets exist (e.g. `NPM_TOKEN`, `NPM_REGISTRY_URL`). Never read secret values.

### 4. GitHub Actions / Workflows

```powershell
gh api repos/{owner}/{repo}/actions/workflows --jq '.workflows[] | {name, state, path}'
```

Check for existing workflows that might conflict.

### 5. Dependabot

```powershell
gh api repos/{owner}/{repo}/vulnerability-alerts 2>&1
```

Check if `.github/dependabot.yml` exists:

```powershell
Test-Path .github/dependabot.yml
```

### 6. Existing Issues / Labels

```powershell
gh label list --repo {owner}/{repo}
```

Ensures labels needed for issue creation (e.g. `cd-setup`) exist.

## Output Format

Report findings as a table:

| Check             | Status                        | Action Required       |
| ----------------- | ----------------------------- | --------------------- |
| Issues enabled    | ✅ / ❌                       | Enable via PATCH      |
| Merge strategy    | ✅ rebase-only / ⚠️ mixed     | Patch to rebase-only  |
| Branch protection | ✅ / ❌ not set               | Set up after CI       |
| Secrets           | ✅ NPM_TOKEN set / ❌ missing | Add in repo settings  |
| Workflows         | ✅ ci.yml / ❌ none           | Create CI workflow    |
| Dependabot        | ✅ / ❌                       | Create dependabot.yml |

Surface all ❌ items as blockers before proceeding.
