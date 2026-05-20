import { ESLintUtils } from '@typescript-eslint/utils';

const DEFAULT_ALLOWED_TEST_SUFFIXES = [
  '.detroit.test.ts',
  '.detroit.test.tsx',
  '.london.test.ts',
  '.london.test.tsx',
  '.contract.test.ts',
  '.contract.test.tsx',
] as const;

const TESTS_DIR_MARKER = '/__tests__/';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type Options = [{ allowedSuffixes?: readonly string[] }];

export const rule = createRule<Options, 'invalidSuffix'>({
  name: 'test-file-suffix-allowlist',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Files inside __tests__/ folders must have an allowed suffix from the configured allowlist.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedSuffixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of allowed test file suffixes (e.g. .detroit.test.ts).',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidSuffix: 'Test file "{{ lintedFileName }}" has invalid suffix. Allowed: {{ allowedSuffixes }}.',
    },
  },
  defaultOptions: [{ allowedSuffixes: [...DEFAULT_ALLOWED_TEST_SUFFIXES] }],
  create(context, [options]) {
    const allowedSuffixes = options.allowedSuffixes ?? DEFAULT_ALLOWED_TEST_SUFFIXES;

    return {
      Program(programNode) {
        const lintedFilePath = context.filename;
        if (!lintedFilePath.includes(TESTS_DIR_MARKER)) return;

        const lintedFileName = lintedFilePath.split('/').pop() ?? '';
        const hasAllowedTestSuffix = allowedSuffixes.some((allowedSuffix) =>
          lintedFileName.endsWith(allowedSuffix),
        );
        if (hasAllowedTestSuffix) return;

        context.report({
          node: programNode,
          messageId: 'invalidSuffix',
          data: {
            lintedFileName,
            allowedSuffixes: allowedSuffixes.join(', '),
          },
        });
      },
    };
  },
});
