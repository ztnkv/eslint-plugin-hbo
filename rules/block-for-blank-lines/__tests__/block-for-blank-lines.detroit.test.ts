import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../block-for-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('block-for-blank-lines', rule, {
  valid: [
    {
      name: 'block for as the only statement — valid',
      code: ['function run() {', '  for (let i = 0; i < 10; i++) {', '    accumulate(i);', '  }', '}'].join('\n'),
    },

    {
      name: 'block for first — blank line after — valid',
      code: [
        'function run() {',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'block for last — blank line before — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '}',
      ].join('\n'),
    },

    {
      name: 'block for in middle — blank lines on both sides — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'block for-of with blanks on both sides — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (const item of items) {',
        '    accumulate(item);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'block for-in with blanks on both sides — valid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (const key in dictionary) {',
        '    accumulate(key);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'non-block (single-statement) for — rule does not apply',
      code: [
        'function run() {',
        '  setup();',
        '  for (let i = 0; i < 10; i++) accumulate(i);',
        '  finalise();',
        '}',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'block for without blank line before — invalid',
      code: [
        'function run() {',
        '  setup();',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockFor' }],
    },

    {
      name: 'block for without blank line after — invalid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  for (let i = 0; i < 10; i++) {',
        '    accumulate(i);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockFor' }],
    },

    {
      name: 'block for-of without blank line before — invalid',
      code: [
        'function run() {',
        '  setup();',
        '  for (const item of items) {',
        '    accumulate(item);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  for (const item of items) {',
        '    accumulate(item);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockFor' }],
    },

    {
      name: 'block for-in without blank line after — invalid',
      code: [
        'function run() {',
        '  setup();',
        '',
        '  for (const key in dictionary) {',
        '    accumulate(key);',
        '  }',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function run() {',
        '  setup();',
        '',
        '  for (const key in dictionary) {',
        '    accumulate(key);',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockFor' }],
    },
  ],
});
