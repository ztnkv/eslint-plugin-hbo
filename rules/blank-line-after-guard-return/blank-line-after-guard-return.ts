import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

function isOneLinerIfReturn(statement: TSESTree.Statement): boolean {
  return (
    statement.type === AST_NODE_TYPES.IfStatement &&
    statement.consequent.type === AST_NODE_TYPES.ReturnStatement &&
    statement.alternate === null
  );
}

function extractReturnNode(statement: TSESTree.Statement): TSESTree.ReturnStatement | null {
  if (statement.type === AST_NODE_TYPES.ReturnStatement) return statement;

  if (statement.type === AST_NODE_TYPES.IfStatement) {
    if (statement.consequent.type === AST_NODE_TYPES.ReturnStatement) {
      return statement.consequent;
    }

    if (statement.consequent.type === AST_NODE_TYPES.BlockStatement) {
      const blockStatement = statement.consequent;
      const lastStatement = blockStatement.body[blockStatement.body.length - 1];

      if (lastStatement?.type === AST_NODE_TYPES.ReturnStatement) return lastStatement;
    }
  }

  return null;
}

export const rule = createRule({
  name: 'blank-line-after-guard-return',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce blank line after non-final return (guard/early exit).',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineAfterGuardReturn: 'Add a blank line after guard return.',
    },
  },
  defaultOptions: [],
  create(context) {
    function checkBlock(statements: readonly TSESTree.Statement[]): void {
      for (let i = 0; i < statements.length - 1; i++) {
        const statement = statements[i]!;
        const nextStatement = statements[i + 1]!;

        if (!extractReturnNode(statement)) continue;

        // Dispatch table exception: skip blank between consecutive one-liner if-returns.
        if (isOneLinerIfReturn(statement) && isOneLinerIfReturn(nextStatement)) continue;

        const statementEndLine = statement.loc.end.line;
        const nextStartLine = nextStatement.loc.start.line;

        if (nextStartLine - statementEndLine < MIN_BLANK_LINE_GAP) {
          context.report({
            node: statement,
            messageId: 'missingBlankLineAfterGuardReturn',
            fix(fixer) {
              return fixer.insertTextAfter(statement, '\n');
            },
          });
        }
      }
    }

    return {
      BlockStatement(node) {
        checkBlock(node.body);
      },
    };
  },
});
