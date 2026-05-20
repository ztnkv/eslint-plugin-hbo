import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../single-expect-per-test.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('single-expect-per-test', rule, {
  valid: [
    {
      name: 'it() with one expect — accepted',
      code: "it('returns 1', () => { expect(fn()).toBe(1); });",
    },

    {
      name: 'test() with one expect — accepted',
      code: "test('returns 1', () => { expect(fn()).toBe(1); });",
    },

    {
      name: 'it.skip() with one expect — accepted',
      code: "it.skip('returns 1', () => { expect(fn()).toBe(1); });",
    },

    {
      name: 'it.only() with one expect — accepted',
      code: "it.only('returns 1', () => { expect(fn()).toBe(1); });",
    },

    {
      name: 'it.each() with one expect — accepted',
      code: "it.each([1, 2])('case %i', (n) => { expect(fn(n)).toBeGreaterThan(0); });",
    },

    {
      name: 'nested expect inside outer expect arg (toThrow) — counts as one',
      code: "it('throws', () => { expect(() => { expect(x).toBe(y); doThrow(); }).toThrow(); });",
    },

    {
      name: 'expect.objectContaining inside matcher — does not count as expect call',
      code: "it('matches shape', () => { expect(obj).toMatchObject(expect.objectContaining({ a: 1 })); });",
    },

    {
      name: 'expect.any inside matcher — does not count as expect call',
      code: "it('shape', () => { expect(obj).toEqual({ id: expect.any(String) }); });",
    },

    {
      name: 'chained .resolves.toBe — single inner expect call',
      code: "it('resolves', async () => { await expect(promise).resolves.toBe(1); });",
    },

    {
      name: 'expect inside outer expect callback (await)',
      code: "it('rejects', async () => { await expect(async () => { expect(true).toBe(true); throw new Error(); }).rejects.toThrow(); });",
    },

    {
      name: 'function declaration without test wrapper — not checked',
      code: 'function helper() { expect(a).toBe(1); expect(b).toBe(2); }',
    },

    {
      name: 'describe block with multiple it — each it has one expect',
      code: "describe('group', () => { it('a', () => { expect(1).toBe(1); }); it('b', () => { expect(2).toBe(2); }); });",
    },
  ],

  invalid: [
    {
      name: 'it() with two expects — rejected',
      code: "it('returns 1 and 2', () => { expect(fn()).toBe(1); expect(other()).toBe(2); });",
      errors: [{ messageId: 'multipleExpects' }],
    },

    {
      name: 'test() with two expects — rejected',
      code: "test('multi assert', () => { expect(a).toBe(1); expect(b).toBe(2); });",
      errors: [{ messageId: 'multipleExpects' }],
    },

    {
      name: 'it() with three expects — single report on second expect',
      code: "it('triple', () => { expect(a).toBe(1); expect(b).toBe(2); expect(c).toBe(3); });",
      errors: [{ messageId: 'multipleExpects' }],
    },

    {
      name: 'it.each() with two expects — rejected',
      code: "it.each([1, 2])('case %i', (n) => { expect(fn(n)).toBeGreaterThan(0); expect(fn(n)).toBeLessThan(10); });",
      errors: [{ messageId: 'multipleExpects' }],
    },

    {
      name: 'async it() with two awaited expects — rejected',
      code: "it('async two', async () => { await expect(p1).resolves.toBe(1); await expect(p2).resolves.toBe(2); });",
      errors: [{ messageId: 'multipleExpects' }],
    },

    {
      name: 'top-level expect counted alongside nested-inside-callback expect',
      code: "it('mixed', () => { expect(a).toBe(1); expect(() => { expect(x).toBe(y); }).not.toThrow(); });",
      errors: [{ messageId: 'multipleExpects' }],
    },
  ],
});
