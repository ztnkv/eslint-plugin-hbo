import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_BLANK_LINE_GAP = 2;

function isSwitch(statement: TSESTree.Statement): statement is TSESTree.SwitchStatement {
  return statement.type === AST_NODE_TYPES.SwitchStatement;
}

export const rule = createRule({
  name: 'block-switch-blank-lines',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require blank lines around switch statements, except when first or last in the enclosing block.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBeforeBlockSwitch: 'Add a blank line before this switch statement.',
      missingBlankLineAfterBlockSwitch: 'Add a blank line after this switch statement.',
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

type SwitchRuleContext = Parameters<(typeof rule)['create']>[0];

function checkStatements(context: SwitchRuleContext, statements: readonly TSESTree.Statement[]): void {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]!;
    if (!isSwitch(statement)) continue;

    const previousStatement = i > 0 ? statements[i - 1]! : null;
    const nextStatement = i < statements.length - 1 ? statements[i + 1]! : null;

    if (previousStatement !== null) {
      const previousEndLine = previousStatement.loc.end.line;
      const currentStartLine = statement.loc.start.line;

      if (currentStartLine - previousEndLine < MIN_BLANK_LINE_GAP) {
        context.report({
          node: statement,
          messageId: 'missingBlankLineBeforeBlockSwitch',
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
          messageId: 'missingBlankLineAfterBlockSwitch',
          fix(fixer) {
            return fixer.insertTextAfter(statement, '\n');
          },
        });
      }
    }
  }
}
