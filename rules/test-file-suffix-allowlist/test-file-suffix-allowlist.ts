import { ESLintUtils } from '@typescript-eslint/utils';

import { parseTestFileName, RECOGNIZED_TEST_STYLE_TOKENS } from '../../test-file-naming.js';

// One suffix per recognized style/category token (× the .tsx twin). Deriving
// these from the shared token list keeps `security` in the allowlist — and in
// the error message — automatically.
const DEFAULT_ALLOWED_TEST_SUFFIXES = RECOGNIZED_TEST_STYLE_TOKENS.flatMap((token) => [
  `.${token}.test.ts`,
  `.${token}.test.tsx`,
]);

const TESTS_DIR_MARKER = '/__tests__/';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type Options = [{ allowedSuffixes?: readonly string[] }];

export const rule = createRule<Options, 'invalidSuffix' | 'compoundSuffix'>({
  name: 'test-file-suffix-allowlist',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Files inside __tests__/ folders must have an allowed suffix from the configured allowlist, with exactly one recognized style token before .test.ts(x).',
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
      compoundSuffix:
        'Test file "{{ lintedFileName }}" stacks multiple style tokens ({{ styleTokens }}) before .test. Use exactly one of: {{ recognizedTokens }}.',
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

        // Reject `<base>.security.detroit.test.ts` & friends: at most one recognized
        // token may precede `.test.ts(x)`. endsWith() alone misses this — the tail
        // still ends with a legal `.detroit.test.ts`.
        const { styleTokens } = parseTestFileName(lintedFileName);
        if (styleTokens.length >= 2) {
          context.report({
            node: programNode,
            messageId: 'compoundSuffix',
            data: {
              lintedFileName,
              styleTokens: styleTokens.join(', '),
              recognizedTokens: RECOGNIZED_TEST_STYLE_TOKENS.join(', '),
            },
          });

          return;
        }

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
