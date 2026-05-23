import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ESLintUtils } from '@typescript-eslint/utils';

const DEFAULT_MIGRATIONS_DIR = 'migrations';

const DEFAULT_TESTS_DIR = '__tests__';

const DEFAULT_TEST_SUFFIX = '.test.ts';

// drizzle bookkeeping — never a migration.
const META_DIR_MARKER = '/meta/';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type Options = [{ migrationsDir?: string; testsDir?: string; testSuffix?: string }];

// `.test.ts` → also accept `.test.tsx`; anything custom is used verbatim plus its tsx twin.
function testSuffixCandidates(testSuffix: string): string[] {
  const tsxTwin = testSuffix.replace(/\.ts$/, '.tsx');

  return tsxTwin === testSuffix ? [testSuffix] : [testSuffix, tsxTwin];
}

export const rule = createRule<Options, 'missingTest'>({
  name: 'migration-must-have-test',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Every forward-only SQL migration must have a co-located verification test (Testcontainers smoke + schema assertion) in the sibling __tests__/ directory.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          migrationsDir: {
            type: 'string',
            description: 'Name of the directory that identifies a migrations subtree.',
          },
          testsDir: {
            type: 'string',
            description: 'Name of the sibling directory holding verification tests.',
          },
          testSuffix: {
            type: 'string',
            description: 'Expected verification-test suffix (the .tsx twin is also accepted).',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingTest:
        "SQL migration '{{migration}}' has no verification test. Add '{{expectedTest}}' (Testcontainers smoke + schema assertion).",
    },
  },
  defaultOptions: [
    { migrationsDir: DEFAULT_MIGRATIONS_DIR, testsDir: DEFAULT_TESTS_DIR, testSuffix: DEFAULT_TEST_SUFFIX },
  ],
  create(context, [options]) {
    const migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
    const testsDir = options.testsDir ?? DEFAULT_TESTS_DIR;
    const testSuffix = options.testSuffix ?? DEFAULT_TEST_SUFFIX;

    return {
      Program(programNode) {
        const migrationPath = context.filename;
        if (!migrationPath.endsWith('.sql')) return;

        // Scope strictly to a configured migrations subtree; skip ad-hoc .sql elsewhere.
        if (!migrationPath.includes(`/${migrationsDir}/`)) return;

        // Never flag drizzle bookkeeping or the tests themselves.
        if (migrationPath.includes(META_DIR_MARKER)) return;
        if (migrationPath.includes(`/${testsDir}/`)) return;

        const migrationFileName = migrationPath.split('/').pop() ?? '';
        const migrationBaseName = migrationFileName.slice(0, migrationFileName.length - '.sql'.length);

        // Migration at <dir>/<base>.sql → test at <dir>/<testsDir>/<base><testSuffix>.
        const migrationDirectoryPath = dirname(migrationPath);
        const candidateExists = testSuffixCandidates(testSuffix).some((suffix) =>
          existsSync(join(migrationDirectoryPath, testsDir, `${migrationBaseName}${suffix}`)),
        );
        if (candidateExists) return;

        const expectedTest = `${testsDir}/${migrationBaseName}${testSuffix}`;

        context.report({
          node: programNode,
          messageId: 'missingTest',
          data: {
            migration: migrationFileName,
            expectedTest,
          },
        });
      },
    };
  },
});
