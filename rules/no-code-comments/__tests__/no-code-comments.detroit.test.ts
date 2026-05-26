import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-code-comments.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester({
  linterOptions: { reportUnusedDisableDirectives: 'off' },
});

ruleTester.run('no-code-comments', rule, {
  valid: [
    {
      name: 'no comments — valid',
      code: 'const commitResult = 1;',
    },

    {
      name: 'eslint-disable-next-line directive — valid',
      code: ['// eslint-disable-next-line no-console', 'console.log(1);'].join('\n'),
    },

    {
      name: '@ts-expect-error directive — valid',
      code: ['// @ts-expect-error — third-party types are wrong', 'doStuff(123);'].join('\n'),
    },

    {
      name: 'block-form eslint-disable-next-line — valid',
      code: ['/* eslint-disable-next-line no-console */', 'console.log(1);'].join('\n'),
    },

    {
      name: 'TODO tag with colon — valid',
      code: ['// TODO: refactor later', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'FIXME tag with colon — valid',
      code: ['// FIXME: race condition under load', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'FIX tag with colon — valid',
      code: ['// FIX: handle null', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'TODO with owner in parens — valid',
      code: ['// TODO(denis): pick a real default', 'const commitResult = 1;'].join('\n'),
    },

    {
      name: 'HACK / NOTE / XXX / BUG — valid',
      code: [
        '// HACK: temporary workaround for upstream bug',
        'const a = 1;',
        '// NOTE: invariant — must run before connect()',
        'const b = 2;',
        '// XXX: revisit when migration #42 lands',
        'const c = 3;',
        '// BUG: returns negative for empty input',
        'const d = 4;',
      ].join('\n'),
    },

    {
      name: 'emergency-escape `// ! ...` — valid',
      code: ['// ! pre-emption window must stay within 50ms; longer breaks the SLA contract', 'const commitResult = 1;'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'plain explanatory line comment — invalid',
      code: ['// describes the next statement', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'plain block comment — invalid',
      code: ['/* describes the next statement */', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'eslint-disable (whole file) — invalid, not a next-line directive',
      code: ['/* eslint-disable no-console */', 'console.log(1);'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'eslint-disable-line directive — invalid, not a next-line directive',
      code: 'const value = 1; // eslint-disable-line no-console',
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: '@ts-ignore directive — invalid, prefer @ts-expect-error',
      code: ['// @ts-ignore', 'doStuff(123);'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'trailing inline comment — invalid',
      code: 'const commitResult = 1; // result of commit',
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'lowercase todo — invalid, must be uppercase tag',
      code: ['// todo: refactor later', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },

    {
      name: 'TODO-like prefix without separator — invalid',
      code: ['// TODOLIST is great', 'const commitResult = 1;'].join('\n'),
      errors: [{ messageId: 'forbiddenComment' }],
    },
  ],
});
