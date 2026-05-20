import { AST_TOKEN_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const LINE_GAP = 1;

function isMultiLine(comment: TSESTree.Comment): boolean {
  return comment.loc.end.line > comment.loc.start.line;
}

function isAdjacentLineComment(prev: TSESTree.Comment, curr: TSESTree.Comment): boolean {
  return (
    prev.type === AST_TOKEN_TYPES.Line &&
    curr.type === AST_TOKEN_TYPES.Line &&
    prev.loc.end.line + LINE_GAP === curr.loc.start.line
  );
}

export const rule = createRule({
  name: 'no-multiline-comments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow multi-line comments: each comment must occupy exactly one line, and consecutive line-comments are forbidden.',
    },
    schema: [],
    messages: {
      multilineBlockComment: 'Block comment spans multiple lines. Replace with a single-line comment.',
      consecutiveLineComments: 'Consecutive line-comments form a multi-line comment. Collapse into one line.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        let lastReportedConsecutiveLine = -1;

        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];
          if (!comment) continue;

          if (comment.type === AST_TOKEN_TYPES.Block && isMultiLine(comment)) {
            context.report({
              loc: comment.loc,
              messageId: 'multilineBlockComment',
            });
            continue;
          }

          const prev = comments[i - 1];
          if (!prev) continue;

          if (isAdjacentLineComment(prev, comment) && prev.loc.start.line !== lastReportedConsecutiveLine) {
            context.report({
              loc: comment.loc,
              messageId: 'consecutiveLineComments',
            });
            lastReportedConsecutiveLine = comment.loc.start.line;
          }
        }
      },
    };
  },
});
