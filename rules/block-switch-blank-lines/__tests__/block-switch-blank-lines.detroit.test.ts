import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../block-switch-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('block-switch-blank-lines', rule, {
  valid: [
    {
      name: 'switch as the only statement — valid',
      code: [
        'function dispatch(kind) {',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '    case "b":',
        '      return 2;',
        '  }',
        '}',
      ].join('\n'),
    },

    {
      name: 'switch first — blank line after — valid',
      code: [
        'function dispatch(kind) {',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },

    {
      name: 'switch last — blank line before — valid',
      code: [
        'function dispatch(kind) {',
        '  setup();',
        '',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '}',
      ].join('\n'),
    },

    {
      name: 'switch in middle — blank lines on both sides — valid',
      code: [
        'function dispatch(kind) {',
        '  setup();',
        '',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'switch without blank line before — invalid',
      code: [
        'function dispatch(kind) {',
        '  setup();',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function dispatch(kind) {',
        '  setup();',
        '',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeBlockSwitch' }],
    },

    {
      name: 'switch without blank line after — invalid',
      code: [
        'function dispatch(kind) {',
        '  setup();',
        '',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '  finalise();',
        '}',
      ].join('\n'),
      output: [
        'function dispatch(kind) {',
        '  setup();',
        '',
        '  switch (kind) {',
        '    case "a":',
        '      return 1;',
        '  }',
        '',
        '  finalise();',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineAfterBlockSwitch' }],
    },
  ],
});
