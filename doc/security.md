# Security Notes

## Known npm audit findings

### ajv@6 ReDoS via `$data` option (moderate)

- **Date recorded**: 2026-02-20
- **Advisory**: [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)
- **Severity**: moderate
- **Affected dependency**: `ajv@6.12.6` (transitive, via `eslint@10.0.1 → ajv@^6.12.4`)
- **npm reports**: 9 moderate vulnerabilities (all the same single ajv issue counted per transitive dependent)

#### Why it cannot be fixed

ESLint (including the latest v10.0.1) depends on `ajv@^6.12.4`. The vulnerability fix exists only in `ajv@8.18.0+`. Upgrading is not possible because:

1. ajv v6 → v8 was a breaking API rewrite
2. ESLint relies on ajv@6 internals (e.g. `lib/refs/json-schema-draft-04.json`) removed in v8
3. The ajv maintainer has not backported the fix to the v6 line

This is an ecosystem-wide issue affecting every project that uses ESLint.

#### Risk assessment

**Practical risk: near-zero.**

- The ReDoS requires the `$data` option, which ESLint does not expose to user input
- `eslint` is a devDependency only — it never runs in production
- The vulnerability cannot be triggered through normal ESLint usage
