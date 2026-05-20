import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../blank-line-after-guard-continue.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('blank-line-after-guard-continue', rule, {
  valid: [
    {
      name: 'guard continue followed by blank line — valid',
      code: ['for (const x of xs) {', '  if (!x) continue;', '', '  process(x);', '}'].join('\n'),
    },

    {
      name: 'guard continue as last statement in block — no next statement to check',
      code: ['for (const x of xs) {', '  if (!x) continue;', '}'].join('\n'),
    },

    {
      name: 'dispatch table — consecutive one-liner if-continues without blank lines between them, blank line before real code — valid',
      code: [
        'for (const x of xs) {',
        '  if (x === null) continue;',
        '  if (x === undefined) continue;',
        '',
        '  process(x);',
        '}',
      ].join('\n'),
    },

    {
      name: 'non-if statement before code — rule does not apply',
      code: ['for (const x of xs) {', '  const y = transform(x);', '  process(y);', '}'].join('\n'),
    },

    {
      name: 'if with block body { continue; } — not a one-liner, rule does not apply',
      code: ['for (const x of xs) {', '  if (!x) {', '    continue;', '  }', '  process(x);', '}'].join('\n'),
    },

    {
      name: 'if-continue with else branch — has alternate, rule does not apply',
      code: ['for (const x of xs) {', '  if (!x) continue;', '  else skip(x);', '  process(x);', '}'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'guard continue immediately followed by next statement — missing blank line',
      code: ['for (const x of xs) {', '  if (!x) continue;', '  process(x);', '}'].join('\n'),
      output: ['for (const x of xs) {', '  if (!x) continue;', '', '  process(x);', '}'].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardContinue' }],
    },

    {
      name: 'dispatch table — last if-continue not followed by blank line before real code — missing blank line',
      code: [
        'for (const [filePath, summary] of Object.entries(map)) {',
        '  if (filePath === TOTAL_KEY) continue;',
        '  if (!summary) continue;',
        '  process(filePath, summary);',
        '}',
      ].join('\n'),
      output: [
        'for (const [filePath, summary] of Object.entries(map)) {',
        '  if (filePath === TOTAL_KEY) continue;',
        '  if (!summary) continue;',
        '',
        '  process(filePath, summary);',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardContinue' }],
    },

    {
      name: 'guard continue preceded by arrange code, immediately followed by next statement — missing blank line',
      code: [
        'for (const x of xs) {',
        '  const layer = findLayer(x);',
        '  if (!layer) continue;',
        '  register(layer);',
        '}',
      ].join('\n'),
      output: [
        'for (const x of xs) {',
        '  const layer = findLayer(x);',
        '  if (!layer) continue;',
        '',
        '  register(layer);',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardContinue' }],
    },
  ],
});
