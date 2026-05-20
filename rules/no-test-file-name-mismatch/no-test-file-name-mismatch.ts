import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ESLintUtils } from '@typescript-eslint/utils';

const DEFAULT_TEST_SUFFIXES = ['.detroit.test.ts', '.london.test.ts', '.contract.test.ts'] as const;

const TESTS_DIR_MARKER = '/__tests__/';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type Options = [{ testSuffixes?: readonly string[] }];

export const rule = createRule<Options, 'missingProductionFile'>({
  name: 'no-test-file-name-mismatch',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Each test file <base>.<style>.test.ts must have a matching production file <base>.ts in the parent area folder.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          testSuffixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of test file suffixes used to extract <base> from <base>.<style>.test.ts.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingProductionFile:
        'Test file "{{ testFileName }}" has no matching production file "{{ expectedProductionFileName }}" in {{ areaDirectoryPath }}.',
    },
  },
  defaultOptions: [{ testSuffixes: [...DEFAULT_TEST_SUFFIXES] }],
  create(context, [options]) {
    const testSuffixes = options.testSuffixes ?? DEFAULT_TEST_SUFFIXES;

    return {
      Program(programNode) {
        const testFilePath = context.filename;
        if (!testFilePath.includes(TESTS_DIR_MARKER)) return;

        const testFileName = testFilePath.split('/').pop() ?? '';
        const matchedTestSuffix = testSuffixes.find((testSuffix) => testFileName.endsWith(testSuffix));
        if (!matchedTestSuffix) return;

        const productionBaseName = testFileName.slice(0, testFileName.length - matchedTestSuffix.length);
        const expectedProductionFileName = `${productionBaseName}.ts`;

        // Test at <area>/__tests__/<base>.<style>.test.ts → production sibling at <area>/<base>.ts.
        const areaDirectoryPath = dirname(dirname(testFilePath));
        const expectedProductionFilePath = join(areaDirectoryPath, expectedProductionFileName);

        if (existsSync(expectedProductionFilePath)) return;

        context.report({
          node: programNode,
          messageId: 'missingProductionFile',
          data: {
            testFileName,
            expectedProductionFileName,
            areaDirectoryPath,
          },
        });
      },
    };
  },
});
