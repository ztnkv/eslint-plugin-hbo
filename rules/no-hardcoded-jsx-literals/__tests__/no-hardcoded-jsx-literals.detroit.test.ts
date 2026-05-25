import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-hardcoded-jsx-literals.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run('no-hardcoded-jsx-literals', rule, {
  valid: [
    {
      name: 'localized text via t() — valid',
      code: 'const x = <Box>{t("greeting")}</Box>;',
    },

    {
      name: 'localized text via i18n.t() — valid',
      code: 'const x = <Box>{i18n.t("greeting")}</Box>;',
    },

    {
      name: 'Trans element children are i18n-managed — valid',
      code: 'const x = <Trans>Colour</Trans>;',
    },

    {
      name: 'text nested under a Trans subtree — valid',
      code: 'const x = <Trans><strong>Colour</strong></Trans>;',
    },

    {
      name: 'dynamic expression child — valid',
      code: 'const x = <Box>{label}</Box>;',
    },

    {
      name: 'number child — valid (no letters)',
      code: 'const x = <Box>{42}</Box>;',
    },

    {
      name: 'numeric text node — valid',
      code: 'const x = <Box>2024</Box>;',
    },

    {
      name: 'pure punctuation text — valid',
      code: 'const x = <Box>—</Box>;',
    },

    {
      name: 'single-letter glyph below the letter threshold — valid',
      code: 'const x = <Box>x</Box>;',
    },

    {
      name: 'whitespace-only text between children — valid',
      code: ['const x = (', '  <Box>', '    <Child />', '  </Box>', ');'].join('\n'),
    },

    {
      name: 'string literal in an attribute — valid by default (attributes unchecked)',
      code: 'const x = <Typography variant="h5" />;',
    },

    {
      name: 'technical enum props untouched — valid',
      code: 'const x = <Stack direction="row" size="small" />;',
    },

    {
      name: 'allowedStrings exact match — valid',
      code: 'const x = <Box>OK</Box>;',
      options: [{ allowedStrings: ['OK'] }],
    },

    {
      name: 'custom translation function name — valid',
      code: 'const x = <Box>{translate("greeting")}</Box>;',
      options: [{ translationFunctionNames: ['translate'] }],
    },

    {
      name: 'custom translation component name — valid',
      code: 'const x = <FormattedMessage>Colour</FormattedMessage>;',
      options: [{ translationComponentNames: ['FormattedMessage'] }],
    },

    {
      name: 'checkAttributes on but attribute not in list — valid',
      code: 'const x = <Input data-testid="email-field" />;',
      options: [{ checkAttributes: true }],
    },

    {
      name: 'checkAttributes on, attribute localized via t() — valid',
      code: 'const x = <Input placeholder={t("email")} />;',
      options: [{ checkAttributes: true }],
    },

    {
      name: 'checkAttributes on, attribute value below letter threshold — valid',
      code: 'const x = <Box title="h5" />;',
      options: [{ checkAttributes: true, attributes: ['title'] }],
    },

    {
      name: 'raised minLetters threshold lets a short word pass — valid',
      code: 'const x = <Box>Go</Box>;',
      options: [{ minLetters: 3 }],
    },
  ],

  invalid: [
    {
      name: 'hardcoded JSX text — invalid',
      code: 'const x = <Typography>Colour</Typography>;',
      errors: [{ messageId: 'hardcodedText' }],
    },

    {
      name: 'string literal as a JSX child expression — invalid',
      code: 'const x = <Box>{"Some copy"}</Box>;',
      errors: [{ messageId: 'hardcodedText' }],
    },

    {
      name: 'template string without substitutions — invalid',
      code: 'const x = <Box>{`Some copy`}</Box>;',
      errors: [{ messageId: 'hardcodedText' }],
    },

    {
      name: 'two hardcoded text siblings — two errors',
      code: 'const x = <Box><span>Hello</span><span>World</span></Box>;',
      errors: [{ messageId: 'hardcodedText' }, { messageId: 'hardcodedText' }],
    },

    {
      name: 'text outside a custom translation component is still flagged — invalid',
      code: 'const x = <Box>Colour<Trans>Localized</Trans></Box>;',
      options: [{ translationComponentNames: ['Trans'] }],
      errors: [{ messageId: 'hardcodedText' }],
    },

    {
      name: 'checkAttributes on, hardcoded placeholder — invalid',
      code: 'const x = <Input placeholder="Enter email" />;',
      options: [{ checkAttributes: true }],
      errors: [{ messageId: 'hardcodedAttribute', data: { attribute: 'placeholder' } }],
    },

    {
      name: 'checkAttributes on, hardcoded aria-label — invalid',
      code: 'const x = <button aria-label="Close dialog" />;',
      options: [{ checkAttributes: true }],
      errors: [{ messageId: 'hardcodedAttribute', data: { attribute: 'aria-label' } }],
    },

    {
      name: 'checkAttributes on, hardcoded attribute via expression container — invalid',
      code: 'const x = <Input placeholder={"Enter email"} />;',
      options: [{ checkAttributes: true }],
      errors: [{ messageId: 'hardcodedAttribute', data: { attribute: 'placeholder' } }],
    },

    {
      name: 'custom attribute list — invalid',
      code: 'const x = <Box helperText="Required field" />;',
      options: [{ checkAttributes: true, attributes: ['helperText'] }],
      errors: [{ messageId: 'hardcodedAttribute', data: { attribute: 'helperText' } }],
    },

    {
      name: 'string not in allowedStrings — invalid',
      code: 'const x = <Box>Cancel</Box>;',
      options: [{ allowedStrings: ['OK'] }],
      errors: [{ messageId: 'hardcodedText' }],
    },
  ],
});
