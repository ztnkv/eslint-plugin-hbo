import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../expect-blank-line.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('expect-blank-line', rule, {
  valid: [
    {
      name: 'expect is the only statement — no preceding statement, no error',
      code: ["it('single', () => {", '  expect(fn()).toBe(1);', '});'].join('\n'),
    },

    {
      name: 'blank line before expect — valid',
      code: ["it('with blank line', () => {", '  const result = fn();', '', '  expect(result).toBe(1);', '});'].join(
        '\n',
      ),
    },

    {
      name: 'await expect with blank line before — valid',
      code: [
        "it('resolves', async () => {",
        '  const result = await fn();',
        '',
        '  await expect(promise).resolves.toBe(1);',
        '});',
      ].join('\n'),
    },

    {
      name: 'test() with blank line before expect — valid',
      code: ['test("passes", () => {', '  const x = compute();', '', '  expect(x).toEqual(42);', '});'].join('\n'),
    },

    {
      name: 'non-expect statements without blank lines between them — not checked',
      code: ["it('arrange only', () => {", '  const a = 1;', '  const b = 2;', '});'].join('\n'),
    },

    {
      name: 'describe wrapping it — only it-body is checked, blank line present',
      code: [
        "describe('suite', () => {",
        "  it('case', () => {",
        '    const x = fn();',
        '',
        '    expect(x).toBe(1);',
        '  });',
        '});',
      ].join('\n'),
    },

    {
      name: 'it.each() factory invocation — body checked, blank line present',
      code: [
        "it.each([1, 2])('case %i', (n) => {",
        '  const result = compute(n);',
        '',
        '  expect(result).toBe(n);',
        '});',
      ].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'no blank line before expect after const — violation with autofix',
      code: ["it('missing blank', () => {", '  const result = fn();', '  expect(result).toBe(1);', '});'].join('\n'),
      output: ["it('missing blank', () => {", '  const result = fn();', '', '  expect(result).toBe(1);', '});'].join(
        '\n',
      ),
      errors: [{ messageId: 'missingBlankLineBeforeExpect' }],
    },

    {
      name: 'no blank line before await expect — violation with autofix',
      code: [
        "it('await missing blank', async () => {",
        '  const result = await fn();',
        '  await expect(promise).resolves.toBe(1);',
        '});',
      ].join('\n'),
      output: [
        "it('await missing blank', async () => {",
        '  const result = await fn();',
        '',
        '  await expect(promise).resolves.toBe(1);',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeExpect' }],
    },

    {
      name: 'test() with no blank line before expect — violation with autofix',
      code: ['test("missing", () => {', '  const x = compute();', '  expect(x).toEqual(42);', '});'].join('\n'),
      output: ['test("missing", () => {', '  const x = compute();', '', '  expect(x).toEqual(42);', '});'].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeExpect' }],
    },

    {
      name: 'expect chained with .toEqual — no blank line — violation with autofix',
      code: [
        "it('repo test', async () => {",
        '  const projects = await repository.listAll();',
        '  expect(projects.map((p) => p.id)).toEqual(expected);',
        '});',
      ].join('\n'),
      output: [
        "it('repo test', async () => {",
        '  const projects = await repository.listAll();',
        '',
        '  expect(projects.map((p) => p.id)).toEqual(expected);',
        '});',
      ].join('\n'),
      errors: [{ messageId: 'missingBlankLineBeforeExpect' }],
    },
  ],
});
