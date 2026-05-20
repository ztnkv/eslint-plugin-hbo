import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

type BlockDoWhileStatement = TSESTree.DoWhileStatement & { body: TSESTree.BlockStatement };

function isBlockDoWhile(statement: TSESTree.Statement): statement is BlockDoWhileStatement {
  return statement.type === AST_NODE_TYPES.DoWhileStatement && statement.body.type === AST_NODE_TYPES.BlockStatement;
}

export const rule = createRule({
  name: 'block-do-while-blank-lines',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require blank lines around do-while statements with a block body, except when first or last in the enclosing block.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBeforeBlockDoWhile: 'Add a blank line before this block do-while statement.',
      missingBlankLineAfterBlockDoWhile: 'Add a blank line after this block do-while statement.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      BlockStatement(node) {
        checkStatements(context, node.body);
      },
    };
  },
});

type DoWhileRuleContext = Parameters<(typeof rule)['create']>[0];

function checkStatements(context: DoWhileRuleContext, statements: readonly TSESTree.Statement[]): void {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]!;
    if (!isBlockDoWhile(statement)) continue;

    const previousStatement = i > 0 ? statements[i - 1]! : null;
    const nextStatement = i < statements.length - 1 ? statements[i + 1]! : null;

    if (previousStatement !== null) {
      const previousEndLine = previousStatement.loc.end.line;
      const currentStartLine = statement.loc.start.line;

      if (currentStartLine - previousEndLine < MIN_BLANK_LINE_GAP) {
        context.report({
          node: statement,
          messageId: 'missingBlankLineBeforeBlockDoWhile',
          fix(fixer) {
            const sourceCode = context.sourceCode;
            const tokenBefore = sourceCode.getTokenBefore(statement, { includeComments: true });
            const insertAfterPos = tokenBefore ? tokenBefore.range[1] : statement.range[0];

            return fixer.insertTextAfterRange([insertAfterPos, insertAfterPos], '\n');
          },
        });
      }
    }

    if (nextStatement !== null) {
      const currentEndLine = statement.loc.end.line;
      const nextStartLine = nextStatement.loc.start.line;

      if (nextStartLine - currentEndLine < MIN_BLANK_LINE_GAP) {
        context.report({
          node: statement,
          messageId: 'missingBlankLineAfterBlockDoWhile',
          fix(fixer) {
            return fixer.insertTextAfter(statement, '\n');
          },
        });
      }
    }
  }
}
