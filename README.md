# @deniszhitnyakov/eslint-plugin-hbo

Opinionated ESLint rules. My own set of conventions, distilled from the code I
write across projects — blank-line discipline, error-handling boundaries, test
file layout, naming hygiene.

I'm publishing them as a plugin because I want the same rules in every
codebase I touch. You're welcome to use them, but be warned: this is not a
neutral linter — it's a personal style guide expressed in AST checks. If you
disagree with a rule, don't enable it.

The "hbo" suffix is a brand, not a project lock-in. The rules are
project-agnostic; a handful that previously hardcoded project-specific names
(base error class, test suffixes) now expose them as options with my own
defaults.

## Install

```sh
npm install --save-dev @deniszhitnyakov/eslint-plugin-hbo
```

Peer dependency: `eslint >= 9`.

## Usage

```js
// eslint.config.js
import hbo from '@deniszhitnyakov/eslint-plugin-hbo';

export default [
  {
    plugins: { hbo },
    rules: {
      'hbo/blank-line-after-guard-return': 'error',
      'hbo/no-throw-standard-error': ['error', { baseClass: 'AppError' }],
      'hbo/test-file-suffix-allowlist': [
        'error',
        { allowedSuffixes: ['.unit.test.ts', '.integration.test.ts'] },
      ],
      // ...
    },
  },
];
```

## Rules

### Blank-line discipline

| Rule | What it enforces |
|---|---|
| `blank-line-after-guard-continue` | Blank line after a guard `continue` inside a loop. |
| `blank-line-after-guard-return` | Blank line after a guard `return` at the top of a function. |
| `blank-line-before-final-return` | Blank line before the final `return` of a function (unless it's the only statement). |
| `block-do-while-blank-lines` | Blank lines around `do...while` blocks. |
| `block-for-blank-lines` | Blank lines around `for` blocks. |
| `block-if-blank-lines` | Blank lines around `if` blocks. |
| `block-switch-blank-lines` | Blank lines around `switch` blocks. |
| `block-while-blank-lines` | Blank lines around `while` blocks. |
| `object-literal-property-spacing` | Blank-line separation between properties of an object literal. |

### Error handling

| Rule | What it enforces | Options |
|---|---|---|
| `no-throw-standard-error` | Disallows `throw new Error / TypeError / RangeError / ...`. All throws must extend the project base error class. | `baseClass: string` — defaults to `AppError`. |

### Test file layout

| Rule | What it enforces | Options |
|---|---|---|
| `test-file-suffix-allowlist` | Files inside `**/__tests__/` must end with one of the allowed suffixes. Exactly one recognized style token (`detroit`, `london`, `contract`, `security`) may precede `.test.ts(x)` — compound names like `.security.detroit.test.ts` are rejected. | `allowedSuffixes: string[]` — defaults to `.detroit.test.ts(x)`, `.london.test.ts(x)`, `.contract.test.ts(x)`, `.security.test.ts(x)`. |
| `no-test-file-name-mismatch` | For `<base>.<style>.test.ts` inside `__tests__/`, a matching `<base>.ts` must exist in the parent area folder. `.security.test.ts(x)` is exempt: a security test names an invariant and is valid with or without a production sibling. | `testSuffixes: string[]` (suffixes that require a sibling) — defaults to `.detroit.test.ts`, `.london.test.ts`, `.contract.test.ts`. `exemptSuffixes: string[]` — defaults to `.security.test.ts`, `.security.test.tsx`. |
| `test-body-aaa-blank-lines` | A test body must be split into Arrange / Act / Assert by exactly two blank-line separators between top-level statements. | — |
| `single-expect-per-test` | One `expect(...)` per `it()` / `test()`. | — |
| `test-matcher-style` | Enforces a single matcher style per assertion (e.g. always `.toBe(true)` not `.toBeTruthy()` for booleans). | — |
| `expect-blank-line` | A blank line before every top-level `expect(...)` inside a test body (the Act/Assert seam). | — |

### Test helpers placement

| Rule | What it enforces |
|---|---|
| `no-inline-test-factories` | Factories (`make*`, `create*`, `build*`, `arrange*`, `Fake*`, `Mock*`) used inside test files must live in `__test-support__/`. |
| `no-reusable-inline-test-helpers` | Any top-level helper used in 2+ test blocks must live in `__test-support__/`. |

### Testing selectors

| Rule | What it enforces | Options |
|---|---|---|
| `no-non-testid-queries` | Single elements must be selected by the test-id attribute only. Flags Testing Library / Playwright `getBy*`/`queryBy*`/`findBy*` (everything but the `TestId` suffix), CSS string selectors in `querySelector`/`closest`/Playwright `locator`/`$`/Cypress `cy.get` that don't reduce to `[data-testid…]`, native `getElementById`, and `cy.contains` (text selection). `get`/`contains` only fire on a `cy` chain root, so `Map.get` is safe; bare `.find()` is left alone. | `attribute: string` (default `data-testid`), `includeMultiple: boolean` (default `false`; also flags `getAllBy*`, `querySelectorAll`, `$$`, `getElementsBy*`), `allowDynamicSelectors: boolean` (default `true`; skips non-static selector args), `allowedMethods: string[]` (default `[]`; escape hatch by method name). |

### Naming & structure

| Rule | What it enforces |
|---|---|
| `identifier-denylist` | Hard ban on a configurable list of identifier names (e.g. `data`, `info`, `manager`, `handler`). |
| `no-multiple-classes-per-file` | One top-level class per file. |
| `no-standalone-functions-with-class` | A file with a top-level class cannot also export standalone top-level functions. |

### Comments

| Rule | What it enforces |
|---|---|
| `no-multiline-comments` | No multi-line `/* ... */` comments; no consecutive `//` lines forming a paragraph. |

### Database migrations

| Rule | What it enforces | Options |
|---|---|---|
| `migration-must-have-test` | Every forward-only `*.sql` migration in a `migrations/` dir must have a co-located verification test `__tests__/<base>.test.ts` (Testcontainers smoke + schema assertion). Skips the drizzle `meta/` folder and the tests themselves. | `migrationsDir` (default `migrations`), `testsDir` (default `__tests__`), `testSuffix` (default `.test.ts`; the `.test.tsx` twin is also accepted). |

`.sql` files aren't in ESLint's default lint set, so this rule keys off the
filename via a tiny passthrough parser the plugin ships (`hbo.parsers.passthrough`).
Wire it up with a dedicated flat-config block scoped to your migrations:

```js
// eslint.config.js
import hbo from '@deniszhitnyakov/eslint-plugin-hbo';

export default [
  {
    files: ['**/migrations/**/*.sql'],
    languageOptions: { parser: hbo.parsers.passthrough },
    plugins: { hbo },
    rules: { 'hbo/migration-must-have-test': 'error' },
  },
];
```

### Framework-specific

| Rule | What it enforces |
|---|---|
| `no-empty-array-zustand-selector` | Catches a common Zustand foot-gun — selectors that return a fresh `[]` on every call and trigger re-renders. |

### Internationalization (i18n)

| Rule | What it enforces | Options |
|---|---|---|
| `no-hardcoded-jsx-literals` | An i18n-aware gate for codebases whose contract is "in JSX, only translation keys — no hardcoded copy". Flags human-language `JSXText` and bare string/template-literal children; leaves already-localized markup (`{t('key')}`, `<Trans>…</Trans>`) and non-language content (numbers, punctuation, single glyphs) alone. | `translationFunctionNames: string[]` (default `['t']`), `translationComponentNames: string[]` (default `['Trans']`), `allowedStrings: string[]` (default `[]`), `checkAttributes: boolean` (default `false`), `attributes: string[]` (default `['aria-label', 'title', 'placeholder', 'alt', 'label']`), `minLetters: number` (default `2`). |

This is not a clone of `react/jsx-no-literals` — that rule flags *every* literal
and has no idea what `t(...)` or `<Trans>` mean, so it can't tell user-facing
copy from technical prop enums. `no-hardcoded-jsx-literals` is i18n-aware: it
recognizes your translation API and only flags copy that actually needs a key.

```jsx
// incorrect — hardcoded user-facing copy
<Typography>Colour</Typography>
<Box>{'Some copy'}</Box>
<Box>{`Some copy`}</Box>

// correct — localized, or not language
<Typography>{t('palette.colour')}</Typography>
<Trans i18nKey="palette.colour">Colour</Trans>
<Box>{count}</Box>
<Stack direction="row" variant="h5" />   // technical props: attributes unchecked by default
```

Scope the rule yourself — it ships no hardcoded file exclusions. Point it at your
component code and exclude stories / design-system / generated files via
`files` / `ignores` in your flat config:

```js
// eslint.config.js
import hbo from '@deniszhitnyakov/eslint-plugin-hbo';

export default [
  {
    files: ['src/**/*.tsx'],
    ignores: ['**/*.stories.tsx'],
    plugins: { hbo },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      // Start at 'warn' while you migrate strings to keys, then promote to 'error'.
      'hbo/no-hardcoded-jsx-literals': [
        'warn',
        { translationFunctionNames: ['t'], translationComponentNames: ['Trans'] },
      ],
    },
  },
];
```

Recommended severity: start with `warn`. There is **no autofix** — replacing a
literal with `t('key')` means choosing a key, which is a human decision.

## Philosophy

A few principles behind these rules:

- **Blank lines are syntax.** I treat blank-line discipline as a first-class part of the language. Visual rhythm is not cosmetic; it carries meaning about block boundaries and execution flow. Most of the rules above exist because I got tired of code reviews about it.
- **Errors are first-class.** Throwing `new Error("...")` from production code is a bug, not shorthand. The codebase should declare its error vocabulary as a class hierarchy, and the linter should enforce it.
- **Tests announce their style.** Detroit, London, Contract — three different schools of testing with different rules about doubles and isolation. A test file's name tells you which one it follows; the linter ensures the rest of the file lives by that choice. `security` is a fourth, orthogonal category: a `*.security.test.ts` pins an invariant (authz-gating, read-only access, secrets redaction) so it's visible by name, runnable as a group, and red in CI when someone cuts the rail — and unlike a style test, it needs no production sibling.
- **Helpers don't squat in tests.** A factory or helper used in 2+ tests is a public artifact and belongs in `__test-support__/`. Squatting it inline costs review time forever.
- **Names follow a verb dictionary.** Top-level functions start with a verb from a small dictionary. No `data`, no `info`, no `manager`. Identifiers stay short, intent-revealing, one word per concept.

## License

MIT
