import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../test-matcher-style.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('test-matcher-style', rule, {
  valid: [
    {
      name: 'detroit — state matcher toBe on top level',
      filename: 'foo.detroit.test.ts',
      code: 'expect(commitResult).toBe(1);',
    },

    {
      name: 'detroit — state matcher toEqual on top level',
      filename: 'foo.detroit.test.ts',
      code: 'expect(commitResult).toEqual({ ok: true });',
    },

    {
      name: 'london — spy matcher toHaveBeenCalled on top level',
      filename: 'foo.london.test.ts',
      code: 'expect(saveCommit).toHaveBeenCalled();',
    },

    {
      name: 'london — spy matcher toHaveBeenCalledWith with asymmetric matcher argument',
      filename: 'foo.london.test.ts',
      code: 'expect(saveCommit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));',
    },

    {
      name: 'contract test — rule does not apply',
      filename: 'foo.contract.test.ts',
      code: 'expect(commitResult).toBe(1); expect(saveCommit).toHaveBeenCalled();',
    },

    {
      name: 'non-test file — rule does not apply',
      filename: 'foo.ts',
      code: 'expect(commitResult).toBe(1);',
    },
  ],

  invalid: [
    {
      name: 'detroit — spy matcher toHaveBeenCalled on top level — invalid',
      filename: 'foo.detroit.test.ts',
      code: 'expect(saveCommit).toHaveBeenCalled();',
      errors: [{ messageId: 'spyMatcherInDetroitTest', data: { name: 'toHaveBeenCalled' } }],
    },

    {
      name: 'detroit — spy matcher toHaveBeenCalledWith on top level — invalid',
      filename: 'foo.detroit.test.ts',
      code: 'expect(saveCommit).toHaveBeenCalledWith({ id: 1 });',
      errors: [{ messageId: 'spyMatcherInDetroitTest', data: { name: 'toHaveBeenCalledWith' } }],
    },

    {
      name: 'detroit — spy matcher nested inside an if block — invalid',
      filename: 'foo.detroit.test.ts',
      code: ['if (condition) {', '  expect(saveCommit).toHaveBeenCalled();', '}'].join('\n'),
      errors: [{ messageId: 'spyMatcherInDetroitTest', data: { name: 'toHaveBeenCalled' } }],
    },

    {
      name: 'london — state matcher toBe on top level — invalid',
      filename: 'foo.london.test.ts',
      code: 'expect(commitResult).toBe(1);',
      errors: [{ messageId: 'stateMatcherInLondonTest', data: { name: 'toBe' } }],
    },

    {
      name: 'london — state matcher toEqual on top level — invalid',
      filename: 'foo.london.test.ts',
      code: 'expect(commitResult).toEqual({ ok: true });',
      errors: [{ messageId: 'stateMatcherInLondonTest', data: { name: 'toEqual' } }],
    },

    {
      name: 'london — state matcher toStrictEqual on top level — invalid',
      filename: 'foo.london.test.ts',
      code: 'expect(commitResult).toStrictEqual({ ok: true });',
      errors: [{ messageId: 'stateMatcherInLondonTest', data: { name: 'toStrictEqual' } }],
    },
  ],
});
