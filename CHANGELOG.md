# Changelog

All notable changes to `@deniszhitnyakov/eslint-plugin-hbo` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and the
project adheres to [Semantic Versioning](https://semver.org/).

## [0.7.0]

### Added

- **`no-code-comments` rule** — disallows code comments outright. The only
  permitted forms are: local next-line rule disables (`// eslint-disable-next-line ...`,
  `// @ts-expect-error ...`, also the block-form `/* eslint-disable-next-line ... */`);
  todo-tags `TODO`, `FIXME`, `FIX`, `HACK`, `NOTE`, `XXX`, `BUG` — the tag must be
  followed by `:`, `(` (for the `TAG(owner): ...` form), or a space (so prefixes like
  `TODOLIST` don't slip through); and the emergency-escape `// ! <reason>` for the
  rare case a comment is genuinely unavoidable. Lowercase `todo:`, whole-file
  `eslint-disable`, same-line `eslint-disable-line`, `@ts-ignore`, and plain
  explanatory comments are all rejected. No options, no autofix.

## [0.6.0]

### Added

- **`no-non-testid-queries` rule** — single elements must be selected by the
  test-id attribute only. Covers Testing Library, Playwright, Cypress and native
  DOM: flags `getBy*`/`queryBy*`/`findBy*` for every suffix but `TestId`, CSS
  string selectors in `querySelector`/`closest`/`locator`/`$`/`cy.get` that don't
  reduce to `[data-testid…]`, native `getElementById`, and `cy.contains` (text
  selection). Collision-safe: `get`/`contains` only fire on a `cy` chain root, so
  `Map.get` is untouched, and bare `.find()` is left alone. Options: `attribute`
  (default `data-testid`), `includeMultiple` (default `false` — also flags
  `getAllBy*`, `querySelectorAll`, `$$`, `getElementsBy*`), `allowDynamicSelectors`
  (default `true` — skips non-static selector args), `allowedMethods` (default
  `[]` — escape hatch by method name). No autofix — a testid is a human decision.

## [0.5.0]

### Added

- **`no-hardcoded-jsx-literals` rule** — an i18n-aware gate for codebases whose
  contract is "in JSX, only translation keys, no hardcoded copy". Unlike
  `react/jsx-no-literals`, it understands the translation API: it leaves
  `{t('key')}` calls and `<Trans>…</Trans>` subtrees alone, ignores non-language
  content (numbers, punctuation, single glyphs, below a configurable letter
  threshold), and flags only human-language `JSXText` and bare
  string/template-literal children. Options: `translationFunctionNames`
  (default `['t']`), `translationComponentNames` (default `['Trans']`),
  `allowedStrings` (default `[]`), `checkAttributes` (default `false`),
  `attributes` (default `['aria-label', 'title', 'placeholder', 'alt', 'label']`),
  `minLetters` (default `2`). No autofix — picking a key is a human decision.
  Recommended starting severity: `warn`.

## [0.4.1]

> Supersedes a withdrawn `0.4.0` that shipped only partial `.security` support
> and was unpublished. npm tombstones the `0.4.0` number, so this work ships as
> `0.4.1`.

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
