import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-multiline-comments.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-multiline-comments', rule, {
  valid: [
    {
      name: 'single line comment alone — valid',
      code: ['// describes the next statement', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'single-line block comment — valid',
      code: ['/* describes the next statement */', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'line comments separated by a statement — valid',
      code: ['// first', 'const a = 1;', '// second', 'const b = 2;'].join('\n'),
    },

    {
      name: 'no comments — valid',
      code: 'const commitResult = 1;',
    },
  ],

  invalid: [
    {
      name: 'block comment spans multiple lines — invalid',
      code: ['/*', ' * describes the next statement', ' */', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'multilineBlockComment' }],
    },

    {
      name: 'two consecutive line comments — invalid',
      code: ['// first half', '// second half', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'consecutiveLineComments' }],
    },

    {
      name: 'three consecutive line comments — invalid',
      code: ['// first', '// second', '// third', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'consecutiveLineComments' }],
    },

    {
      name: 'block comment with inline /* */ form spanning two lines — invalid',
      code: ['/* opens here', '   closes here */', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'multilineBlockComment' }],
    },
  ],
});
