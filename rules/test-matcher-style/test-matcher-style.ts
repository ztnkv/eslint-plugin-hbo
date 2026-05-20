import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { SPY_MATCHERS, STATE_MATCHERS } from './test-matcher-sets.js';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type TestStyle = 'detroit' | 'london';

function getTestStyle(filename: string): TestStyle | null {
  if (filename.endsWith('.detroit.test.ts') || filename.endsWith('.detroit.test.tsx')) {
    return 'detroit';
  }

  if (filename.endsWith('.london.test.ts') || filename.endsWith('.london.test.tsx')) {
    return 'london';
  }

  return null;
}

function isExpectChain(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.CallExpression) {
    return node.callee.type === AST_NODE_TYPES.Identifier && node.callee.name === 'expect';
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return isExpectChain(node.object);
  }

  return false;
}

export const rule = createRule({
  name: 'test-matcher-style',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Detroit/London matcher style based on the test file suffix.',
    },
    schema: [],
    messages: {
      spyMatcherInDetroitTest:
        "Spy matcher '{{name}}' is forbidden in Detroit-style tests. Use a state-based assertion.",

      stateMatcherInLondonTest:
        "State matcher '{{name}}' is forbidden at the top level of London-style tests. Assert on collaborator calls instead.",
    },
  },
  defaultOptions: [],
  create(context) {
    const style = getTestStyle(context.filename);
    if (style === null) return {};

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (!isExpectChain(callee.object)) return;

        const matcherName = callee.property.name;

        if (style === 'detroit' && SPY_MATCHERS.has(matcherName)) {
          context.report({
            node: callee.property,
            messageId: 'spyMatcherInDetroitTest',
            data: { name: matcherName },
          });
        } else if (style === 'london' && STATE_MATCHERS.has(matcherName)) {
          context.report({
            node: callee.property,
            messageId: 'stateMatcherInLondonTest',
            data: { name: matcherName },
          });
        }
      },
    };
  },
});
