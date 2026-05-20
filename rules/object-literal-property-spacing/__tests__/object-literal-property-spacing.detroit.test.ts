import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../object-literal-property-spacing.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('object-literal-property-spacing', rule, {
  valid: [
    {
      name: 'all single-line properties — no blank lines',
      code: ['const obj = {', '  a: 1,', '  b: 2,', '  c: 3,', '};'].join('\n'),
    },

    {
      name: 'all block properties — blank lines between them',
      code: [
        'const obj = {',
        '  foo() {',
        '    return 1;',
        '  },',
        '',
        '  bar() {',
        '    return 2;',
        '  },',
        '};',
      ].join('\n'),
    },

    {
      name: 'mixed properties — no blank lines',
      code: ['const obj = {', '  a: 1,', '  foo() {', '    return 2;', '  },', '  b: 3,', '};'].join('\n'),
    },

    {
      name: 'array of objects with blank lines between elements — valid',
      code: ['const arr = [', '  {', '    a: 1,', '  },', '', '  {', '    b: 2,', '  },', '];'].join('\n'),
    },

    {
      name: 'empty object — fewer than two properties, ignored',
      code: 'const obj = {};',
    },

    {
      name: 'single property — fewer than two, ignored',
      code: ['const obj = {', '  a: 1,', '};'].join('\n'),
    },

    {
      name: 'array with hole (null element) — null filtered out, surviving has fewer than two',
      code: 'const arr = [, 1];',
    },

    {
      name: 'mixed properties with no blank lines — valid (rule applies blank-line gate only to all-block objects)',
      code: ['const obj = {', '  a: 1,', '  foo() {', '    return 1;', '  },', '};'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'all single-line properties with unexpected blank line',
      code: ['const obj = {', '  a: 1,', '', '  b: 2,', '};'].join('\n'),
      output: ['const obj = {', '  a: 1,', '  b: 2,', '};'].join('\n'),
      errors: [{ messageId: 'unexpectedBlankLineBetweenProperties' }],
    },

    {
      name: 'all block properties without blank line between them',
      code: ['const obj = {', '  foo() {', '    return 1;', '  },', '  bar() {', '    return 2;', '  },', '};'].join(
        '\n',
      ),
      output: [
        'const obj = {',
        '  foo() {',
        '    return 1;',
        '  },',
        '',
        '  bar() {',
        '    return 2;',
        '  },',
        '};',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBetweenBlockProperties' }],
    },

    {
      name: 'array of objects without blank lines between elements — missing blank line',
      code: ['const arr = [', '  {', '    a: 1,', '  },', '  {', '    b: 2,', '  },', '];'].join('\n'),
      output: ['const arr = [', '  {', '    a: 1,', '  },', '', '  {', '    b: 2,', '  },', '];'].join('\n'),
      errors: [{ messageId: 'missingBlankLineBetweenBlockProperties' }],
    },
  ],
});
