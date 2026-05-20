import { ESLintUtils } from '@typescript-eslint/utils';

import { collectTopLevelDeclarations } from './no-reusable-declarations.js';
import { walkAndCount } from './no-reusable-usage-counter.js';

const FACTORY_NAME_PATTERN = /^(make|create|build|arrange)[A-Z]|^(Fake|Mock)[A-Z]/;
const REUSABLE_THRESHOLD = 2;

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

export const rule = createRule({
  name: 'no-reusable-inline-test-helpers',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Top-level helpers in *.test.ts files used in 2+ test blocks must live in __test-support__/, not inline.',
    },
    schema: [],
    messages: {
      reusableHelper:
        "Helper '{{name}}' is used in {{count}} test blocks — extract to __test-support__/. See docs/mvp/testing.md §6.3 Принцип 4.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const declarations = collectTopLevelDeclarations(program, FACTORY_NAME_PATTERN);
        if (declarations.size === 0) return;

        const counts = new Map<string, number>();
        const names = new Set(declarations.keys());

        walkAndCount(program, 0, names, counts);

        for (const [name, identifier] of declarations.entries()) {
          const count = counts.get(name) ?? 0;
          if (count < REUSABLE_THRESHOLD) continue;

          context.report({
            node: identifier,
            messageId: 'reusableHelper',
            data: { name, count: String(count) },
          });
        }
      },
    };
  },
});
