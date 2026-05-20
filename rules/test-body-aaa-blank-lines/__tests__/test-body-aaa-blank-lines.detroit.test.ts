import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../test-body-aaa-blank-lines.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('test-body-aaa-blank-lines', rule, {
  valid: [
    {
      name: 'three statements split into Arrange | Act | Assert by two blank lines — valid',
      code: [
        "it('case', () => {",
        '  const a = setup();',
        '',
        '  const b = act(a);',
        '',
        '  expect(b).toBe(1);',
        '});',
      ].join('\n'),
    },

    {
      name: 'multi-line Arrange and Act blocks with two separators — valid',
      code: [
        "it('aaa', async () => {",
        '  const x = makeX();',
        '  const y = makeY();',
        '',
        '  await save(x);',
        '  const found = await load(y);',
        '',
        '  expect(found).toEqual(x);',
        '});',
      ].join('\n'),
    },

    {
      name: 'two statements only — skipped (covered by expect-blank-line)',
      code: ["it('small', () => {", '  const x = fn();', '', '  expect(x).toBe(1);', '});'].join('\n'),
    },

    {
      name: 'single statement — skipped',
      code: ["it('mini', () => {", '  expect(fn()).toBe(1);', '});'].join('\n'),
    },

    {
      name: 'test() with two separators — valid',
      code: [
        "test('passes', () => {",
        '  const a = 1;',
        '',
        '  const b = a + 1;',
        '',
        '  expect(b).toBe(2);',
        '});',
      ].join('\n'),
    },

    {
      name: 'it.each with two separators in body — valid',
      code: [
        "it.each([1, 2])('case %i', (n) => {",
        '  const x = n;',
        '',
        '  const y = x + 1;',
        '',
        '  expect(y).toBe(n + 1);',
        '});',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'three blank-line separators (every statement separated) — too many',
      code: [
        "it('over-separated', async () => {",
        '  const a = makeA();',
        '  const b = makeB();',
        '',
        '  await save(a);',
        '',
        '  const found = await load(b);',
        '',
        '  expect(found).toEqual(a);',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'wrongSeparatorCount', data: { required: '2', actual: '3' } }],
    },

    {
      name: 'no blank-line separators at all — too few',
      code: ["it('packed', () => {", '  const a = setup();', '  const b = act(a);', '  expect(b).toBe(1);', '});'].join(
        '\n',
      ),
      errors: [{ messageId: 'wrongSeparatorCount', data: { required: '2', actual: '0' } }],
    },

    {
      name: 'only one blank-line separator with three statements — too few',
      code: [
        "it('one-sep', () => {",
        '  const a = setup();',
        '  const b = act(a);',
        '',
        '  expect(b).toBe(1);',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'wrongSeparatorCount', data: { required: '2', actual: '1' } }],
    },
  ],
});
