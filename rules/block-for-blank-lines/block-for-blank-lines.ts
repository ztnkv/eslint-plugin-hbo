import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

type BlockForStatement = (TSESTree.ForStatement | TSESTree.ForInStatement | TSESTree.ForOfStatement) & {
  body: TSESTree.BlockStatement;
};

function isBlockFor(statement: TSESTree.Statement): statement is BlockForStatement {
  return (
    (statement.type === AST_NODE_TYPES.ForStatement ||
      statement.type === AST_NODE_TYPES.ForInStatement ||
      statement.type === AST_NODE_TYPES.ForOfStatement) &&
    statement.body.type === AST_NODE_TYPES.BlockStatement
  );
}

export const rule = createRule({
  name: 'block-for-blank-lines',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require blank lines around for/for-in/for-of statements with a block body, except when first or last in the enclosing block.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBeforeBlockFor: 'Add a blank line before this block for statement.',
      missingBlankLineAfterBlockFor: 'Add a blank line after this block for statement.',
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

type ForRuleContext = Parameters<(typeof rule)['create']>[0];

function checkStatements(context: ForRuleContext, statements: readonly TSESTree.Statement[]): void {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]!;
    if (!isBlockFor(statement)) continue;

    const previousStatement = i > 0 ? statements[i - 1]! : null;
    const nextStatement = i < statements.length - 1 ? statements[i + 1]! : null;

    if (previousStatement !== null) {
      const previousEndLine = previousStatement.loc.end.line;
      const currentStartLine = statement.loc.start.line;

      if (currentStartLine - previousEndLine < MIN_BLANK_LINE_GAP) {
        context.report({
          node: statement,
          messageId: 'missingBlankLineBeforeBlockFor',
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
          messageId: 'missingBlankLineAfterBlockFor',
          fix(fixer) {
            return fixer.insertTextAfter(statement, '\n');
          },
        });
      }
    }
  }
}
