import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

import { childNodes, findCallbackArgument } from '../../ast-helpers.js';

const TEST_BLOCK_NAMES = new Set(['it', 'test']);

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

export const rule = createRule({
  name: 'single-expect-per-test',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Each it()/test() block must contain exactly one top-level expect() call (SRP — single intent per test).',
    },
    schema: [],
    messages: {
      multipleExpects:
        'Test case contains {{count}} top-level expect() calls. SRP requires exactly one per test — split into separate it()/test() blocks with names describing each behavior independently.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestBlockCall(node)) return;

        const callback = findCallbackArgument(node);
        if (callback === null) return;

        const topLevelExpects = collectTopLevelExpects(callback.body);
        if (topLevelExpects.length <= 1) return;

        const secondaryExpect = topLevelExpects[1];
        if (secondaryExpect === undefined) return;

        context.report({
          node: secondaryExpect,
          messageId: 'multipleExpects',
          data: { count: String(topLevelExpects.length) },
        });
      },
    };
  },
});

function isTestBlockCall(node: TSESTree.CallExpression): boolean {
  const callee = node.callee;

  if (callee.type === AST_NODE_TYPES.Identifier) {
    return TEST_BLOCK_NAMES.has(callee.name);
  }

  if (callee.type === AST_NODE_TYPES.MemberExpression && callee.object.type === AST_NODE_TYPES.Identifier) {
    return TEST_BLOCK_NAMES.has(callee.object.name);
  }

  if (
    callee.type === AST_NODE_TYPES.CallExpression &&
    callee.callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.callee.object.type === AST_NODE_TYPES.Identifier
  ) {
    return TEST_BLOCK_NAMES.has(callee.callee.object.name);
  }

  return false;
}

function collectTopLevelExpects(rootNode: TSESTree.Node): TSESTree.CallExpression[] {
  const found: TSESTree.CallExpression[] = [];
  visit(rootNode, found);

  return found;
}

function visit(node: TSESTree.Node, accumulator: TSESTree.CallExpression[]): void {
  if (isDirectExpectCall(node)) {
    accumulator.push(node);
    // skip args — nested expects belong to this scope (e.g. `expect(() => expect(x).toBe(y)).toThrow()`)
    return;
  }

  for (const child of childNodes(node)) {
    visit(child, accumulator);
  }
}

function isDirectExpectCall(node: TSESTree.Node): node is TSESTree.CallExpression {
  if (node.type !== AST_NODE_TYPES.CallExpression) return false;

  const callee = node.callee;

  return callee.type === AST_NODE_TYPES.Identifier && callee.name === 'expect';
}
