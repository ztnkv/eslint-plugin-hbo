import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../block-do-while-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('block-do-while-blank-lines', rule, {
  valid: [
    {
      name: 'block do-while as the only statement — valid',
      code: ['function run() {', '  do {', '    consumeNext();', '  } while (hasMore());', '}'].join('\n'),
    },

    {
      name: 'block do-while first — blank line after — valid',
      code: [
        'function run() {',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'block do-while last — blank line before — valid',
      code: ['function run() {', '  setup();', '', '  do {', '    consumeNext();', '  } while (hasMore());', '}'].join(
        '\n',
      ),
    },

    {
      name: 'block do-while in middle — blank lines on both sides — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'block do-while without blank line before — invalid',
      code: [
        'function run() {',
        '  setup();',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockDoWhile' }],
    },

    {
      name: 'block do-while without blank line after — invalid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  do {',
        '    consumeNext();',
        '  } while (hasMore());',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockDoWhile' }],
    },
  ],
});
