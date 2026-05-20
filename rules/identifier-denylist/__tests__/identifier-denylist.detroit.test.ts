import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../identifier-denylist.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('identifier-denylist', rule, {
  valid: [
    {
      name: 'compound variable name with denylist word as suffix — valid',
      code: 'const commitResult = readDiff();',
    },

    {
      name: 'compound variable name with denylist word as prefix — valid',
      code: 'const extractedLines = readLogLines();',
    },

    {
      name: 'compound parameter name containing denylist word — valid',
      code: 'function applyDiff(commitResult) {}',
    },

    {
      name: 'compound function name containing denylist word — valid',
      code: 'function buildCommitPayload() {}',
    },

    {
      name: 'compound class method name — valid',
      code: 'class Repo { readCommit() {} }',
    },

    {
      name: 'compound class property name — valid',
      code: 'class Repo { commitResult = 1; }',
    },

    {
      name: 'destructuring variable with denylist-named property — id is not an Identifier, skipped',
      code: 'const { data: payloadShape } = readResponse();',
    },

    {
      name: 'computed class method key — non-Identifier, skipped',
      code: 'class Repo { ["dynamicKey"]() {} }',
    },

    {
      name: 'class constructor — skipped (kind === "constructor")',
      code: 'class Repo { constructor() {} }',
    },

    {
      name: 'function expression with non-denylist param — valid',
      code: 'const factory = function (workspacePath) { return workspacePath; };',
    },

    {
      name: 'arrow function with non-denylist param — valid',
      code: 'const factory = (workspacePath) => workspacePath;',
    },
  ],

  invalid: [
    {
      name: 'variable named "result" — exact denylist match',
      code: 'const result = readDiff();',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'result' } }],
    },

    {
      name: 'variable named "data" — exact denylist match',
      code: 'const data = {};',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'data' } }],
    },

    {
      name: 'variable named "temp" — exact denylist match',
      code: 'const temp = buildCommitPayload();',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'temp' } }],
    },

    {
      name: 'function declaration named "temp" — exact denylist match',
      code: 'function temp() {}',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'temp' } }],
    },

    {
      name: 'parameter named "value" — exact denylist match',
      code: 'function applyDiff(value) {}',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'value' } }],
    },

    {
      name: 'variable named "extracted" — verb-form denylist match',
      code: 'const extracted = parseCommitMessage();',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'extracted' } }],
    },

    {
      name: 'variable named "obj" — shorthand denylist match',
      code: 'const obj = buildCommitPayload();',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'obj' } }],
    },

    {
      name: 'class method named "data" — exact denylist match',
      code: 'class Repo { data() {} }',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'data' } }],
    },

    {
      name: 'class property named "result" — exact denylist match',
      code: 'class Repo { result = 1; }',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'result' } }],
    },

    {
      name: 'function expression with denylist param — rejected',
      code: 'const factory = function (data) { return data; };',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'data' } }],
    },

    {
      name: 'arrow function with denylist param — rejected',
      code: 'const factory = (data) => data;',
      errors: [{ messageId: 'identifierInDenylist', data: { name: 'data' } }],
    },
  ],
});
