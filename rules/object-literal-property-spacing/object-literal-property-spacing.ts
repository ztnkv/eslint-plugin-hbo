import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const MIN_PROPERTIES = 2;

function isMultiLine(node: TSESTree.Node): boolean {
  return node.loc.end.line > node.loc.start.line;
}

export const rule = createRule({
  name: 'object-literal-property-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce blank lines between object literal properties based on their type.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLineBetweenBlockProperties: 'Add a blank line between block properties.',
      unexpectedBlankLineBetweenProperties: 'Remove blank line between single-line properties.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ObjectExpression(node) {
        checkItems(context, sourceCode, node.properties);
      },

      ArrayExpression(node) {
        checkItems(context, sourceCode, node.elements);
      },
    };
  },
});

type SpacingRuleContext = Parameters<(typeof rule)['create']>[0];
type SourceCode = SpacingRuleContext['sourceCode'];
type FixFunction = NonNullable<Parameters<SpacingRuleContext['report']>[0]['fix']>;

function hasBlankLineBetween(sourceCode: SourceCode, prev: TSESTree.Node, curr: TSESTree.Node): boolean {
  const lines = sourceCode.lines;

  for (let lineNumber = prev.loc.end.line + 1; lineNumber < curr.loc.start.line; lineNumber++) {
    const lineText = lines[lineNumber - 1];
    if (lineText?.trim() === '') return true;
  }

  return false;
}

function fixAddBlankLine(sourceCode: SourceCode, curr: TSESTree.Node): FixFunction {
  return (fixer) => {
    const tokenBefore = sourceCode.getTokenBefore(curr, { includeComments: true });
    if (!tokenBefore) return null;

    return fixer.insertTextAfterRange([tokenBefore.range[1], tokenBefore.range[1]], '\n');
  };
}

function fixRemoveBlankLine(sourceCode: SourceCode, prev: TSESTree.Node, curr: TSESTree.Node): FixFunction {
  return (fixer) => {
    const tokenAfterPrev = sourceCode.getTokenAfter(prev, { includeComments: true });
    if (!tokenAfterPrev) return null;

    const text = sourceCode.getText();
    const gapStart = tokenAfterPrev.range[1];
    const gapEnd = curr.range[0];
    const gap = text.slice(gapStart, gapEnd);
    const fixed = gap.replace(/\n\s*\n(\s*)/, '\n$1');

    return fixer.replaceTextRange([gapStart, gapEnd], fixed);
  };
}

function checkItems(
  context: SpacingRuleContext,
  sourceCode: SourceCode,
  items: readonly (TSESTree.Node | null)[],
): void {
  const nodes = items.filter((item): item is TSESTree.Node => item !== null);
  if (nodes.length < MIN_PROPERTIES) return;

  const allBlock = nodes.every(isMultiLine);

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    if (!prev || !curr) continue;

    const hasBlank = hasBlankLineBetween(sourceCode, prev, curr);

    if (allBlock && !hasBlank) {
      context.report({
        node: curr,
        messageId: 'missingBlankLineBetweenBlockProperties',
        fix: fixAddBlankLine(sourceCode, curr),
      });
    } else if (!allBlock && hasBlank) {
      context.report({
        node: curr,
        messageId: 'unexpectedBlankLineBetweenProperties',
        fix: fixRemoveBlankLine(sourceCode, prev, curr),
      });
    }
  }
}
