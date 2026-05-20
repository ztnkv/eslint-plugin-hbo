import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { findCallbackArgument } from '../../ast-helpers.js';

const TEST_BLOCK_NAMES = new Set(['it', 'test']);
const REQUIRED_SEPARATOR_COUNT = 2;
const MIN_STATEMENTS_FOR_AAA = 3;
const BLANK_LINE_GAP = 2;

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

export const rule = createRule({
  name: 'test-body-aaa-blank-lines',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce exactly two blank-line separators inside an it()/test() body to keep Arrange / Act / Assert visually grouped.',
    },
    schema: [],
    messages: {
      wrongSeparatorCount:
        'AAA convention: a test body must be split into Arrange / Act / Assert by exactly {{required}} blank-line separators between top-level statements (found {{actual}}). Group statements that belong to the same phase together and put a single blank line between phases. If this test genuinely has only one or two phases (an exceptional case — be sure before claiming it), suppress with `// eslint-disable-next-line hbo/test-body-aaa-blank-lines` on the `it`/`test` call.',
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
        if (statements.length < MIN_STATEMENTS_FOR_AAA) return;

        let separatorCount = 0;

        for (let i = 1; i < statements.length; i++) {
          const prev = statements[i - 1];
          const curr = statements[i];
          if (prev === undefined || curr === undefined) continue;

          if (curr.loc.start.line - prev.loc.end.line >= BLANK_LINE_GAP) {
            separatorCount += 1;
          }
        }

        if (separatorCount === REQUIRED_SEPARATOR_COUNT) return;

        context.report({
          node: callback,
          messageId: 'wrongSeparatorCount',
          data: {
            required: String(REQUIRED_SEPARATOR_COUNT),
            actual: String(separatorCount),
          },
        });
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
