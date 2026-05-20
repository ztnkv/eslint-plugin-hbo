import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-test-file-name-mismatch.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const currentTestFileDir = dirname(fileURLToPath(import.meta.url));
// __test-support__ is four levels up: .../no-test-file-name-mismatch/__tests__/ → ../../../__test-support__/
const fixturesAreaPath = resolve(currentTestFileDir, '../../../__test-support__');

const ruleTester = new RuleTester();

ruleTester.run('no-test-file-name-mismatch', rule, {
  valid: [
    {
      name: 'detroit test next to existing production file — accepted',
      code: 'export {};',
      filename: `${fixturesAreaPath}/__tests__/fixture.detroit.test.ts`,
    },

    {
      name: 'london test next to existing production file — accepted',
      code: 'export {};',
      filename: `${fixturesAreaPath}/__tests__/fixture.london.test.ts`,
    },

    {
      name: 'production file outside __tests__/ — not checked',
      code: 'export {};',
      filename: `${fixturesAreaPath}/fixture.ts`,
    },

    {
      name: 'unknown suffix outside allowlist — not checked here (suffix-allowlist enforces)',
      code: 'export {};',
      filename: `${fixturesAreaPath}/__tests__/fixture.test.ts`,
    },
  ],

  invalid: [
    {
      name: 'detroit test for non-existing production file — rejected',
      code: 'export {};',
      filename: `${fixturesAreaPath}/__tests__/missing-base.detroit.test.ts`,
      errors: [{ messageId: 'missingProductionFile' }],
    },

    {
      name: 'contract test for non-existing port file — rejected',
      code: 'export {};',
      filename: `${fixturesAreaPath}/__tests__/missing-base.contract.test.ts`,
      errors: [{ messageId: 'missingProductionFile' }],
    },
  ],
});
