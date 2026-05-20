import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../test-file-suffix-allowlist.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('test-file-suffix-allowlist', rule, {
  valid: [
    {
      name: '.detroit.test.ts inside __tests__/ — accepted',
      code: 'export {};',
      filename: '/repo/src/backend/area/__tests__/some-thing.detroit.test.ts',
    },

    {
      name: '.london.test.ts inside __tests__/ — accepted',
      code: 'export {};',
      filename: '/repo/src/backend/area/__tests__/some-thing.london.test.ts',
    },

    {
      name: '.contract.test.ts inside __tests__/ — accepted',
      code: 'export {};',
      filename: '/repo/src/backend/area/__tests__/some-thing.contract.test.ts',
    },

    {
      name: 'production file outside __tests__/ — not checked',
      code: 'export {};',
      filename: '/repo/src/backend/area/some-thing.ts',
    },
  ],

  invalid: [
    {
      name: 'plain .test.ts inside __tests__/ — rejected',
      code: 'export {};',
      filename: '/repo/src/backend/area/__tests__/some-thing.test.ts',
      errors: [{ messageId: 'invalidSuffix' }],
    },

    {
      name: '.spec.ts inside __tests__/ — rejected',
      code: 'export {};',
      filename: '/repo/src/backend/area/__tests__/some-thing.spec.ts',
      errors: [{ messageId: 'invalidSuffix' }],
    },
  ],
});
