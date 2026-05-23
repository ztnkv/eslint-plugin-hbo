import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { passthrough } from '../../../parsers/passthrough.js';
import { rule } from '../migration-must-have-test.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const currentTestFileDir = dirname(fileURLToPath(import.meta.url));
// __test-support__ is three levels up: .../migration-must-have-test/__tests__/ → ../../../__test-support__/
const fixturesAreaPath = resolve(currentTestFileDir, '../../../__test-support__');
const migrationsPath = `${fixturesAreaPath}/migrations`;

// `.sql` files reach ESLint only through the passthrough parser; mirror the consumer setup.
const ruleTester = new RuleTester({ languageOptions: { parser: passthrough } });

ruleTester.run('migration-must-have-test', rule, {
  valid: [
    {
      name: 'migration with a matching __tests__/<base>.test.ts — accepted',
      code: 'CREATE TABLE users (id serial PRIMARY KEY);',
      filename: `${migrationsPath}/0000_init.sql`,
    },

    {
      name: 'drizzle meta/ snapshot json — ignored (non-.sql)',
      code: '{}',
      filename: `${migrationsPath}/meta/0000_snapshot.json`,
    },

    {
      name: '.sql inside meta/ — ignored',
      code: 'SELECT 1;',
      filename: `${migrationsPath}/meta/weird.sql`,
    },

    {
      name: '.sql outside any migrations/ dir — ignored',
      code: 'SELECT * FROM users;',
      filename: `${fixturesAreaPath}/queries/get_user.sql`,
    },

    {
      name: 'a test file under __tests__/ — ignored (non-.sql)',
      code: 'export {};',
      filename: `${migrationsPath}/__tests__/0000_init.test.ts`,
    },
  ],

  invalid: [
    {
      name: 'migration without any verification test — rejected',
      code: 'CREATE TABLE x (id int);',
      filename: `${migrationsPath}/0001_add_x.sql`,
      errors: [
        {
          messageId: 'missingTest',
          data: {
            migration: '0001_add_x.sql',
            expectedTest: '__tests__/0001_add_x.test.ts',
          },
        },
      ],
    },

    {
      name: 'a second untested migration — also rejected (one error per file)',
      code: 'CREATE TABLE y (id int);',
      filename: `${migrationsPath}/0002_add_y.sql`,
      errors: [{ messageId: 'missingTest' }],
    },
  ],
});
