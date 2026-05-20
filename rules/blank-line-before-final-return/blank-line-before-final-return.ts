import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

export const rule = createRule({
  name: 'blank-line-before-final-return',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce blank line before the final return statement of a function body.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBeforeFinalReturn: 'Add a blank line before the final return.',
    },
  },
  defaultOptions: [],
  create(context) {
    function checkFunctionBody(body: TSESTree.BlockStatement): void {
      const statements = body.body;
      if (statements.length < MIN_BLANK_LINE_GAP) return;

      const finalStatement = statements[statements.length - 1]!;
      if (finalStatement.type !== AST_NODE_TYPES.ReturnStatement) return;

      const previousStatement = statements[statements.length - MIN_BLANK_LINE_GAP]!;
      const previousEndLine = previousStatement.loc.end.line;
      const finalStartLine = finalStatement.loc.start.line;

      if (finalStartLine - previousEndLine < MIN_BLANK_LINE_GAP) {
        context.report({
          node: finalStatement,
          messageId: 'missingBlankLineBeforeFinalReturn',
          fix(fixer) {
            const sourceCode = context.sourceCode;
            const tokenBefore = sourceCode.getTokenBefore(finalStatement, { includeComments: true });
            const insertAfterPos = tokenBefore ? tokenBefore.range[1] : finalStatement.range[0];

            return fixer.insertTextAfterRange([insertAfterPos, insertAfterPos], '\n');
          },
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        if (node.body) checkFunctionBody(node.body);
      },

      FunctionExpression(node) {
        if (node.body) checkFunctionBody(node.body);
      },

      ArrowFunctionExpression(node) {
        if (node.body.type === AST_NODE_TYPES.BlockStatement) checkFunctionBody(node.body);
      },
    };
  },
});
