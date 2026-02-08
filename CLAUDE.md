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

Branch protection on `main`. Always use feature branches + PRs.
See https://github.com/cuioss/cuioss-organization/blob/main/CLAUDE.md for full workflow.
