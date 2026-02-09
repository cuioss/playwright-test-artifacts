# CLAUDE.md

## Repository Purpose

Standalone npm package providing Playwright test artifact infrastructure:
- Browser console/error/network log capture per test
- Automatic screenshots (start/end of each test)
- Artifact file persistence to `testInfo.outputDir`
- Reusable Playwright fixture factory

Published as `@cuioss/playwright-test-artifacts` on npm.

## Key Commands

```bash
npm ci                  # Install dependencies
npm test                # Run tests with coverage (c8 + node:test)
npm run lint            # ESLint
npm run format:check    # Prettier check
```

## Architecture

- ESM-only (`"type": "module"`)
- `@playwright/test` as peerDependency (not bundled)
- Node.js built-in test runner (`node --test`)
- `c8` for coverage (produces lcov.info for SonarCloud)

## Git Workflow

All cuioss repositories have branch protection on `main`. Direct pushes to `main` are never allowed. Always use this workflow:

1. Create a feature branch: `git checkout -b <branch-name>`
2. Commit changes: `git add <files> && git commit -m "<message>"`
3. Push the branch: `git push -u origin <branch-name>`
4. Create a PR: `gh pr create --repo cuioss/playwright-test-artifacts --head <branch-name> --base main --title "<title>" --body "<body>"`
5. Wait for CI + Gemini review (waits until checks complete): `gh pr checks --watch`
6. **Handle Gemini review comments** — fetch with `gh api repos/cuioss/playwright-test-artifacts/pulls/<pr-number>/comments` and for each:
    - If clearly valid and fixable: fix it, commit, push, then reply explaining the fix and resolve the comment
    - If disagree or out of scope: reply explaining why, then resolve the comment
    - If uncertain (not 100% confident): **ask the user** before acting
    - Every comment MUST get a reply (reason for fix or reason for not fixing) and MUST be resolved
7. Do **NOT** enable auto-merge unless explicitly instructed. Wait for user approval.
8. Return to main: `git checkout main && git pull`