import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../block-while-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('block-while-blank-lines', rule, {
  valid: [
    {
      name: 'block while as the only statement — valid',
      code: ['function run() {', '  while (hasMore()) {', '    consumeNext();', '  }', '}'].join('\n'),
    },

    {
      name: 'block while first — blank line after — valid',
      code: ['function run() {', '  while (hasMore()) {', '    consumeNext();', '  }', '', '  finalise();', '}'].join(
        '\n',
      ),
    },

    {
      name: 'block while last — blank line before — valid',
      code: ['function run() {', '  setup();', '', '  while (hasMore()) {', '    consumeNext();', '  }', '}'].join(
        '\n',
      ),
    },

    {
      name: 'block while in middle — blank lines on both sides — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  while (hasMore()) {',
        '    consumeNext();',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'non-block (single-statement) while — rule does not apply',
      code: ['function run() {', '  setup();', '  while (hasMore()) consumeNext();', '  finalise();', '}'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'block while without blank line before — invalid',
      code: [
        'function run() {',
        '  setup();',
        '  while (hasMore()) {',
        '    consumeNext();',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  while (hasMore()) {',
        '    consumeNext();',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockWhile' }],
    },

    {
      name: 'block while without blank line after — invalid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  while (hasMore()) {',
        '    consumeNext();',
        '  }',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  while (hasMore()) {',
        '    consumeNext();',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockWhile' }],
    },
  ],
});
