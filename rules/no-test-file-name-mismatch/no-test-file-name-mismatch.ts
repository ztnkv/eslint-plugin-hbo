import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ESLintUtils } from '@typescript-eslint/utils';

import { parseTestFileName } from '../../test-file-naming.js';

const DEFAULT_TEST_SUFFIXES = ['.detroit.test.ts', '.london.test.ts', '.contract.test.ts'] as const;

// Security tests are a first-class category: the file name states an invariant
// (authz-gating, read-only access, secrets redaction) and is valid whether or
// not a production unit of the same base name exists next to it.
const DEFAULT_EXEMPT_SUFFIXES = ['.security.test.ts', '.security.test.tsx'] as const;

const TESTS_DIR_MARKER = '/__tests__/';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type Options = [{ testSuffixes?: readonly string[]; exemptSuffixes?: readonly string[] }];

export const rule = createRule<Options, 'missingProductionFile'>({
  name: 'no-test-file-name-mismatch',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Each test file <base>.<style>.test.ts must have a matching production file <base>.ts in the parent area folder, except for exempt suffixes (e.g. .security.test.ts).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          testSuffixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of test file suffixes that require a matching production sibling.',
          },
          exemptSuffixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suffixes that never require a production sibling (e.g. .security.test.ts).',
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
  defaultOptions: [{ testSuffixes: [...DEFAULT_TEST_SUFFIXES], exemptSuffixes: [...DEFAULT_EXEMPT_SUFFIXES] }],
  create(context, [options]) {
    const testSuffixes = options.testSuffixes ?? DEFAULT_TEST_SUFFIXES;
    const exemptSuffixes = options.exemptSuffixes ?? DEFAULT_EXEMPT_SUFFIXES;

    return {
      Program(programNode) {
        const testFilePath = context.filename;
        if (!testFilePath.includes(TESTS_DIR_MARKER)) return;

        const testFileName = testFilePath.split('/').pop() ?? '';

        // Parse the name through the shared source of truth so the full recognized
        // tail (single or compound) is stripped exactly as suffix-allowlist sees it.
        const { styleTokens, base, recognizedTail } = parseTestFileName(testFileName);
        if (recognizedTail === null || base === null) return;

        // Exempt comparison uses the FULL tail, so a compound like
        // `.detroit.security.test.ts` never matches a single-token `.security.test.ts`
        // exemption — it stays subject to the sibling requirement.
        if (exemptSuffixes.includes(recognizedTail)) return;

        // Single recognized token: honor testSuffixes (lets a user opt a style out).
        // Compound (>= 2 tokens) is always enforced — its base has no sibling, which
        // keeps the verdict consistent with suffix-allowlist rejecting it.
        if (styleTokens.length === 1 && !testSuffixes.includes(recognizedTail)) return;

        const expectedProductionFileName = `${base}.ts`;

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
