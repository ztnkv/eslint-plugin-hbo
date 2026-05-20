import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-throw-standard-error.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-throw-standard-error', rule, {
  valid: [
    {
      name: 'throws custom error class — valid',
      code: 'throw new CustomError("msg");',
    },

    {
      name: 'throws realistic HBOError descendant — valid',
      code: 'throw new GitNotInstalledError();',
    },

    {
      name: 're-throws caught value — valid',
      code: ['try { doWork(); } catch (err) { throw err; }'].join('\n'),
    },

    {
      name: 'throws plain identifier — valid',
      code: ['const err = makeError(); throw err;'].join('\n'),
    },

    {
      name: 'throws member-call result — valid',
      code: 'throw errorFactory.build();',
    },

    {
      name: 'no throw at all — valid',
      code: 'const value = 1;',
    },
  ],

  invalid: [
    {
      name: 'throw new Error — invalid',
      code: 'throw new Error("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new TypeError — invalid',
      code: 'throw new TypeError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new RangeError — invalid',
      code: 'throw new RangeError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new SyntaxError — invalid',
      code: 'throw new SyntaxError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new EvalError — invalid',
      code: 'throw new EvalError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new URIError — invalid',
      code: 'throw new URIError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'throw new ReferenceError — invalid',
      code: 'throw new ReferenceError("msg");',
      errors: [{ messageId: 'useDomainErrorDescendant' }],
    },

    {
      name: 'two standard throws — two errors',
      code: ['throw new Error("a");', 'throw new TypeError("b");'].join('\n'),
      errors: [{ messageId: 'useDomainErrorDescendant' }, { messageId: 'useDomainErrorDescendant' }],
    },
  ],
});
