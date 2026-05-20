import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { findCallbackArgument } from '../../ast-helpers.js';

const TEST_BLOCK_NAMES = new Set(['it', 'test']);
const MIN_LINE_GAP = 2;

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

export const rule = createRule({
  name: 'expect-blank-line',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a blank line before each top-level expect() statement in a test block (AAA discipline).',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBeforeExpect: 'Add a blank line before expect() to separate the Assert phase (AAA discipline).',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestBlockCall(node)) return;

        const callback = findCallbackArgument(node);
        if (callback === null) return;

        const body = callback.body;
        if (body.type !== AST_NODE_TYPES.BlockStatement) return;

        const statements = body.body;

        for (let i = 1; i < statements.length; i++) {
          const statement = statements[i];
          if (statement === undefined || !isExpectStatement(statement)) continue;

          const prevStatement = statements[i - 1];
          if (prevStatement === undefined) continue;

          if (statement.loc.start.line - prevStatement.loc.end.line < MIN_LINE_GAP) {
            context.report({
              node: statement,
              messageId: 'missingBlankLineBeforeExpect',
              fix(fixer) {
                const sourceCode = context.sourceCode;
                const tokenBefore = sourceCode.getTokenBefore(statement, { includeComments: true });
                const insertAfterPos = tokenBefore !== null ? tokenBefore.range[1] : statement.range[0];

                return fixer.insertTextAfterRange([insertAfterPos, insertAfterPos], '\n');
              },
            });
          }
        }
      },
    };
  },
});

function isTestBlockCall(node: TSESTree.CallExpression): boolean {
  const { callee } = node;

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

function isExpectStatement(statement: TSESTree.Statement): boolean {
  if (statement.type !== AST_NODE_TYPES.ExpressionStatement) return false;

  return isExpectCallChain(statement.expression);
}

function isExpectCallChain(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.Super) return false;
  if (node.type === AST_NODE_TYPES.AwaitExpression) return isExpectCallChain(node.argument);
  if (node.type === AST_NODE_TYPES.MemberExpression) return isExpectCallChain(node.object);
  if (node.type !== AST_NODE_TYPES.CallExpression) return false;

  const { callee } = node;
  if (callee.type === AST_NODE_TYPES.Identifier) return callee.name === 'expect';

  return isExpectCallChain(callee);
}
