import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../blank-line-before-final-return.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('blank-line-before-final-return', rule, {
  valid: [
    {
      name: 'blank line before final return — valid',
      code: ['function foo(x: number): number {', '  const y = x * 2;', '', '  return y;', '}'].join('\n'),
    },

    {
      name: 'return is the only statement — no blank line required',
      code: ['function foo(x: number): number {', '  return x * 2;', '}'].join('\n'),
    },

    {
      name: 'dispatch table + final return with blank line — valid',
      code: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        '',
        "  return 'positive';",
        '}',
      ].join('\n'),
    },

    {
      name: 'empty function body — no statements, ignored',
      code: 'function noop(): void {}',
    },

    {
      name: 'function body where final statement is not a return — ignored',
      code: ['function sideEffect(x: number): void {', '  const y = x * 2;', '  console.log(y);', '}'].join('\n'),
    },

    {
      name: 'arrow function with expression body — not a BlockStatement, ignored',
      code: 'const double = (x: number) => x * 2;',
    },

    {
      name: 'arrow function with block body — blank line before final return is valid',
      code: ['const double = (x: number) => {', '  const y = x * 2;', '', '  return y;', '};'].join('\n'),
    },

    {
      name: 'function expression assigned to const — blank line before final return is valid',
      code: ['const f = function (x: number) {', '  const y = x * 2;', '', '  return y;', '};'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'final return without blank line before it — missing blank line',
      code: ['function foo(x: number): number {', '  const y = x * 2;', '  return y;', '}'].join('\n'),
      output: ['function foo(x: number): number {', '  const y = x * 2;', '', '  return y;', '}'].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeFinalReturn' }],
    },

    {
      name: 'arrow with block body and missing blank line — auto-fix inserts it',
      code: ['const double = (x: number) => {', '  const y = x * 2;', '  return y;', '};'].join('\n'),
      output: ['const double = (x: number) => {', '  const y = x * 2;', '', '  return y;', '};'].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeFinalReturn' }],
    },

    {
      name: 'function expression assigned to const — missing blank line',
      code: ['const f = function (x: number) {', '  const y = x * 2;', '  return y;', '};'].join('\n'),
      output: ['const f = function (x: number) {', '  const y = x * 2;', '', '  return y;', '};'].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeFinalReturn' }],
    },

    {
      name: 'final return after dispatch table without blank line — missing blank line',
      code: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        "  return 'positive';",
        '}',
      ].join('\n'),
      output: [
        'function classify(x: number): string {',
        "  if (x < 0) return 'negative';",
        "  if (x === 0) return 'zero';",
        '',
        "  return 'positive';",
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeFinalReturn' }],
    },
  ],
});
