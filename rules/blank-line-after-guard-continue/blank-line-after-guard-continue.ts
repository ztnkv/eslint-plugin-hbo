import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

function isOneLinerIfContinue(statement: TSESTree.Statement): boolean {
  return (
    statement.type === AST_NODE_TYPES.IfStatement &&
    statement.consequent.type === AST_NODE_TYPES.ContinueStatement &&
    statement.alternate === null
  );
}

export const rule = createRule({
  name: 'blank-line-after-guard-continue',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce blank line after one-liner if-continue (guard/filter) when followed by more code.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineAfterGuardContinue: 'Add a blank line after guard continue.',
    },
  },
  defaultOptions: [],
  create(context) {
    function checkBlock(statements: readonly TSESTree.Statement[]): void {
      for (let i = 0; i < statements.length - 1; i++) {
        const statement = statements[i]!;
        const nextStatement = statements[i + 1]!;

        if (!isOneLinerIfContinue(statement)) continue;

        // Dispatch table exception: skip blank between consecutive one-liner if-continues.
        if (isOneLinerIfContinue(nextStatement)) continue;

        const statementEndLine = statement.loc.end.line;
        const nextStartLine = nextStatement.loc.start.line;

        if (nextStartLine - statementEndLine < MIN_BLANK_LINE_GAP) {
          context.report({
            node: statement,
            messageId: 'missingBlankLineAfterGuardContinue',
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
