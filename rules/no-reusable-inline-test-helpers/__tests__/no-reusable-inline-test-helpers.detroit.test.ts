import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-reusable-inline-test-helpers.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-reusable-inline-test-helpers', rule, {
  valid: [
    {
      name: 'top-level helper used in exactly one it — local, accepted',
      code: "function sleep(ms) { return ms; } it('case', () => { sleep(10); expect(1).toBe(1); });",
    },

    {
      name: 'top-level helper never used — accepted (dead-code is not our concern)',
      code: 'function sleep(ms) { return ms; }',
    },

    {
      name: 'helper with factory-naming prefix — caught by sibling rule, ignored here',
      code: "function makeAdapter() { return {}; } it('a', () => makeAdapter()); it('b', () => makeAdapter());",
    },

    {
      name: 'type alias used in multiple tests — type-only, ignored',
      code: "type Helper = (x: number) => number; it('a', () => { const h: Helper = (x) => x; }); it('b', () => { const h: Helper = (x) => x; });",
    },

    {
      name: 'helper declared inside describe — local to group scope, ignored',
      code: "describe('group', () => { function helper() { return 1; } it('a', () => helper()); it('b', () => helper()); });",
    },

    {
      name: 'helper called only in non-test-block scope — not counted',
      code: 'function helper() { return 1; } const x = helper(); const y = helper();',
    },

    {
      name: 'two distinct helpers each used once — neither reusable',
      code: "function a() {} function b() {} it('case', () => { a(); b(); expect(1).toBe(1); });",
    },

    {
      name: 'variable initialised with non-function value — not tracked as helper',
      code: "const value = 42; it('a', () => value + 1); it('b', () => value + 2);",
    },

    {
      name: 'destructuring declarator — left side not an Identifier, ignored',
      code: "const { x } = { x: 1 }; it('a', () => x); it('b', () => x);",
    },

    {
      name: 'helper called inside a non-test-block callback (forEach) — not counted',
      code: 'function helper() {} [1, 2].forEach(() => { helper(); helper(); });',
    },
  ],

  invalid: [
    {
      name: 'top-level function used in two it blocks — rejected',
      code: "function sleep() { return 1; } it('a', () => { sleep(); }); it('b', () => { sleep(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'sleep', count: '2' } }],
    },

    {
      name: 'top-level arrow used in two test blocks — rejected',
      code: "const sleep = () => 1; test('a', () => { sleep(); }); test('b', () => { sleep(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'sleep', count: '2' } }],
    },

    {
      name: 'top-level function used in it + beforeEach — counted as 2 test-block usages',
      code: "function helper() { return 1; } beforeEach(() => { helper(); }); it('case', () => { helper(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },

    {
      name: 'top-level function used in three it blocks — count is 3',
      code: "function helper() {} it('a', () => helper()); it('b', () => helper()); it('c', () => helper());",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '3' } }],
    },

    {
      name: 'top-level class used in two it blocks — rejected',
      code: "class Probe { run() {} } it('a', () => { new Probe(); }); it('b', () => { new Probe(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'Probe', count: '2' } }],
    },

    {
      name: 'top-level helper called from nested arrow within it — still counted',
      code: "function delay() {} it('a', () => { setTimeout(() => delay(), 1); }); it('b', () => { delay(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'delay', count: '2' } }],
    },

    {
      name: 'exported top-level helper used in two tests — rejected',
      code: "export function sleep() {} it('a', () => sleep()); it('b', () => sleep());",
      errors: [{ messageId: 'reusableHelper', data: { name: 'sleep', count: '2' } }],
    },

    {
      name: 'two reusable helpers each reported separately',
      code: "function a() {} function b() {} it('x', () => { a(); b(); }); it('y', () => { a(); b(); });",
      errors: [
        { messageId: 'reusableHelper', data: { name: 'a', count: '2' } },
        { messageId: 'reusableHelper', data: { name: 'b', count: '2' } },
      ],
    },

    {
      name: 'top-level arrow inside variable declaration used in two tests — rejected',
      code: "const helper = () => 1; it('a', () => helper()); it('b', () => helper());",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },

    {
      name: 'helper called via it.skip member-expression — counted',
      code: "function helper() {} it.skip('a', () => helper()); it.skip('b', () => helper());",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },

    {
      name: 'helper called via test.each(...)(...) call-of-member-expression — counted',
      code: "function helper() {} test.each([1])('a', () => helper()); test.each([1])('b', () => helper());",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },

    {
      name: 'helper instantiated via new in two test blocks — counted',
      code: "class Probe {} it('a', () => { new Probe(); new Probe(); }); it('b', () => { new Probe(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'Probe', count: '3' } }],
    },

    {
      name: 'helper inside FunctionExpression test callback — counted',
      code: "function helper() {} it('a', function () { helper(); }); it('b', function () { helper(); });",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },

    {
      name: 'test-block call with no callback argument still walks other arguments',
      code: "function helper() {} it('a', () => helper()); it('b', () => helper()); it.todo('c');",
      errors: [{ messageId: 'reusableHelper', data: { name: 'helper', count: '2' } }],
    },
  ],
});
