import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-inline-test-factories.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-inline-test-factories', rule, {
  valid: [
    {
      name: 'top-level function without factory prefix — accepted',
      code: 'function helper() { return 1; }',
    },

    {
      name: 'top-level utility function (sleep) — caught by usage-count rule, not this one',
      code: 'function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }',
    },

    {
      name: 'top-level arrow without factory prefix — accepted',
      code: 'const helper = () => 1;',
    },

    {
      name: 'type alias with factory prefix — type-only, not a runtime declaration',
      code: 'type MakeOffice = (overrides?: object) => object;',
    },

    {
      name: 'interface with factory prefix — type-only',
      code: 'interface MakeAdapterOptions { db: string; }',
    },

    {
      name: 'factory declaration inside describe callback — local to group scope',
      code: "describe('group', () => { function makeAdapter() { return {}; } it('uses it', () => { expect(makeAdapter()).toBeTruthy(); }); });",
    },

    {
      name: 'factory declaration inside it callback — local to single test',
      code: "it('case', () => { function makeAdapter() { return {}; } expect(makeAdapter()).toBeTruthy(); });",
    },

    {
      name: 'top-level prefix-like name without uppercase boundary — accepted',
      code: 'function makeup() { return 1; }',
    },

    {
      name: 'top-level variable assigned to existing factory — not a declaration with factory name',
      code: 'import { makeAdapter } from "./helpers.js"; const factory = makeAdapter;',
    },

    {
      name: 'describe/it/test/beforeEach/afterEach calls — not declarations',
      code: "describe('group', () => { beforeEach(() => {}); afterEach(() => {}); it('case', () => {}); });",
    },

    {
      name: 'variable with factory prefix initialised by object literal — not a function, ignored',
      code: 'const makeAdapter = { run: () => 1 };',
    },

    {
      name: 'variable with factory prefix declared without initializer — ignored',
      code: 'let makeAdapter;',
    },

    {
      name: 'destructuring declarator with factory-shaped name — non-Identifier id, ignored',
      code: 'const { makeAdapter } = imported;',
    },

    {
      name: 'top-level statement that is not a declaration (expression) — ignored',
      code: "console.log('hello');",
    },
  ],

  invalid: [
    {
      name: 'top-level function makeAdapter — rejected',
      code: 'function makeAdapter() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeAdapter' } }],
    },

    {
      name: 'top-level function createBackend — rejected',
      code: 'function createBackend() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'createBackend' } }],
    },

    {
      name: 'top-level function buildScenario — rejected',
      code: 'function buildScenario() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'buildScenario' } }],
    },

    {
      name: 'top-level function arrangeTest — rejected',
      code: 'function arrangeTest() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'arrangeTest' } }],
    },

    {
      name: 'top-level arrow makeAdapter — rejected',
      code: 'const makeAdapter = () => ({});',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeAdapter' } }],
    },

    {
      name: 'top-level function expression makeAdapter — rejected',
      code: 'const makeAdapter = function () { return {}; };',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeAdapter' } }],
    },

    {
      name: 'top-level class FakeApp — rejected',
      code: 'class FakeApp { run() {} }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'FakeApp' } }],
    },

    {
      name: 'top-level class MockShutdownRegistry — rejected',
      code: 'class MockShutdownRegistry { register() {} }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'MockShutdownRegistry' } }],
    },

    {
      name: 'top-level exported function makeAdapter — rejected',
      code: 'export function makeAdapter() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeAdapter' } }],
    },

    {
      name: 'top-level exported arrow buildX — rejected',
      code: 'export const buildX = () => ({});',
      errors: [{ messageId: 'inlineFactory', data: { name: 'buildX' } }],
    },

    {
      name: 'multiple top-level factories — each reported',
      code: 'function makeA() {} function makeB() {}',
      errors: [
        { messageId: 'inlineFactory', data: { name: 'makeA' } },
        { messageId: 'inlineFactory', data: { name: 'makeB' } },
      ],
    },

    {
      name: 'export default function with factory prefix — rejected',
      code: 'export default function makeRoot() { return {}; }',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeRoot' } }],
    },

    {
      name: 'multiple declarators in one const — only factory-prefixed is reported',
      code: 'const helper = () => 1, makeAdapter = () => ({});',
      errors: [{ messageId: 'inlineFactory', data: { name: 'makeAdapter' } }],
    },
  ],
});
