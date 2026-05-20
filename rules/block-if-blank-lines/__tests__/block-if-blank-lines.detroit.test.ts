import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../block-if-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('block-if-blank-lines', rule, {
  valid: [
    {
      name: 'block if is first statement — no blank line required before',
      code: [
        'function foo(x: number): void {',
        '  if (x > 0) {',
        '    doSomething();',
        '  }',
        '',
        '  doOther();',
        '}',
      ].join('\n'),
    },

    {
      name: 'block if is last statement — no blank line required after',
      code: [
        'function foo(x: number): void {',
        '  doSomething();',
        '',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '}',
      ].join('\n'),
    },

    {
      name: 'one-liner if without braces — rule does not apply',
      code: ['function foo(x: number): void {', '  doSomething();', '  if (x > 0) return;', '  doOther();', '}'].join(
        '\n',
      ),
    },

    {
      name: 'block if with blank lines on both sides — valid',
      code: [
        'function foo(x: number): void {',
        '  doSomething();',
        '',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '',
        '  doFinal();',
        '}',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'block if without blank line before it — not first statement',
      code: [
        'function foo(x: number): void {',
        '  doSomething();',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '',
        '  doFinal();',
        '}',
      ].join('\n'),
      output: [
        'function foo(x: number): void {',
        '  doSomething();',
        '',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '',
        '  doFinal();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockIf' }],
    },

    {
      name: 'block if without blank line after it — not last statement',
      code: [
        'function foo(x: number): void {',
        '  doSomething();',
        '',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '  doFinal();',
        '}',
      ].join('\n'),
      output: [
        'function foo(x: number): void {',
        '  doSomething();',
        '',
        '  if (x > 0) {',
        '    doOther();',
        '  }',
        '',
        '  doFinal();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockIf' }],
    },
  ],
});
