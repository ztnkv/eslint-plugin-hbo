# Changelog

All notable changes to `@deniszhitnyakov/eslint-plugin-hbo` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and the
project adheres to [Semantic Versioning](https://semver.org/).

## [0.4.0]

### Added

- **`.security.test.ts(x)` as a first-class test-file suffix**, applied
  consistently across both naming rules:
  - `test-file-suffix-allowlist`: `security` joins `detroit` / `london` /
    `contract` in the default allowlist, so `*.security.test.ts(x)` is valid and
    appears automatically in the "Allowed" error message.
  - `no-test-file-name-mismatch`: new `exemptSuffixes` option (default
    `['.security.test.ts', '.security.test.tsx']`). A security test names an
    invariant and is valid with or without a production sibling — both
    `secrets-redaction.security.test.ts` (no sibling) and
    `serialize-transport-error.security.test.ts` (sibling exists) pass.

### Fixed

- **Cross-rule parsing inconsistency on compound names.** The two rules used to
  parse file names differently: `test-file-suffix-allowlist` looked at the tail
  while `no-test-file-name-mismatch` stripped only the last `.<style>.test.ts`
  token. A name like `serialize-transport-error.security.detroit.test.ts` would
  pass one rule and be rejected by the other. Both rules now parse names through
  a single shared module (`test-file-naming.ts`) and give a consistent verdict.
- Compound suffixes (more than one recognized style token before `.test.ts`,
  e.g. `*.security.detroit.test.ts`, `*.detroit.security.test.ts`) are now
  rejected by `test-file-suffix-allowlist` with a dedicated `compoundSuffix`
  message — exactly one token is allowed.

## [0.3.0]

### Added

- `migration-must-have-test` rule: every forward-only `*.sql` migration in a
  `migrations/` directory must have a co-located verification test.
- `passthrough` parser, so file-name/filesystem-only rules can act on otherwise
  unparsed files (e.g. `.sql`).

## [0.2.0]

### Changed

- `no-throw-standard-error`: default `baseClass` is now `AppError`.

## [0.1.0]

- Initial public release.
