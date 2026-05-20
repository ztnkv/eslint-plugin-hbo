import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../blank-line-after-guard-return.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('blank-line-after-guard-return', rule, {
  valid: [
    {
      name: 'guard return followed by blank line — valid',
      code: ['function foo(x: number): number {', '  if (x < 0) return 0;', '', '  return x * 2;', '}'].join('\n'),
    },

    {
      name: 'multi-line guard block followed by blank line — valid',
      code: [
        'function foo(x: number): number {',
        '  if (x < 0) {',
        '    return 0;',
        '  }',
        '',
        '  return x * 2;',
        '}',
      ].join('\n'),
    },

    {
      name: 'dispatch table — consecutive one-liner if-returns without blank lines between them, blank line before fallback — valid',
      code: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        "  if (x > 0) return 'positive';",
        '',
        "  return 'unknown';",
        '}',
      ].join('\n'),
    },

    {
      name: 'final return only — no guard, no blank line required',
      code: ['function foo(x: number): number {', '  return x * 2;', '}'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'guard return immediately followed by next statement — missing blank line',
      code: ['function foo(x: number): number {', '  if (x < 0) return 0;', '  return x * 2;', '}'].join('\n'),
      output: ['function foo(x: number): number {', '  if (x < 0) return 0;', '', '  return x * 2;', '}'].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardReturn' }],
    },

    {
      name: 'guard return after arrange code, immediately followed by next statement — missing blank line',
      code: [
        'function foo(items: string[]): string {',
        '  const first = items[0];',
        "  if (!first) return '';",
        '  return first.toUpperCase();',
        '}',
      ].join('\n'),
      output: [
        'function foo(items: string[]): string {',
        '  const first = items[0];',
        "  if (!first) return '';",
        '',
        '  return first.toUpperCase();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardReturn' }],
    },

    {
      name: 'dispatch table — last if-guard not followed by blank line before fallback return — missing blank line',
      code: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        "  if (x > 0) return 'positive';",
        "  return 'unknown';",
        '}',
      ].join('\n'),
      output: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        "  if (x > 0) return 'positive';",
        '',
        "  return 'unknown';",
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterGuardReturn' }],
    },
  ],
});
