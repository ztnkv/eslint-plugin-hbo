import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const ZUSTAND_HOOK_NAME = /^use[A-Z]\w*Store$/;
const EQUALITY_ARG_INDEX = 1;

function isEmptyCollectionLiteral(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.ArrayExpression) return node.elements.length === 0;

  if (node.type === AST_NODE_TYPES.ObjectExpression) return node.properties.length === 0;

  return false;
}

function isFreshEmptyFallback(expression: TSESTree.Expression): boolean {
  if (expression.type === AST_NODE_TYPES.LogicalExpression) {
    if (expression.operator !== '??' && expression.operator !== '||') return false;

    return isEmptyCollectionLiteral(expression.right);
  }

  if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
    return isEmptyCollectionLiteral(expression.consequent) || isEmptyCollectionLiteral(expression.alternate);
  }

  return isEmptyCollectionLiteral(expression);
}

function selectorReturnsFreshEmpty(selector: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression): boolean {
  const body = selector.body;
  if (body.type !== AST_NODE_TYPES.BlockStatement) return isFreshEmptyFallback(body);

  for (const statement of body.body) {
    if (statement.type !== AST_NODE_TYPES.ReturnStatement) continue;

    if (statement.argument === null) continue;

    if (isFreshEmptyFallback(statement.argument)) return true;
  }

  return false;
}

function hasEqualityArgument(call: TSESTree.CallExpression): boolean {
  const equalityArg = call.arguments[EQUALITY_ARG_INDEX];
  if (equalityArg === undefined) return false;

  return (
    equalityArg.type === AST_NODE_TYPES.Identifier ||
    equalityArg.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    equalityArg.type === AST_NODE_TYPES.FunctionExpression ||
    equalityArg.type === AST_NODE_TYPES.MemberExpression
  );
}

function isZustandHookCallee(callee: TSESTree.Expression): boolean {
  if (callee.type !== AST_NODE_TYPES.Identifier) return false;

  return ZUSTAND_HOOK_NAME.test(callee.name);
}

export const rule = createRule({
  name: 'no-empty-array-zustand-selector',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Zustand selectors that return a fresh empty array/object literal on every render ' +
        '(triggers infinite re-render under default reference equality).',
    },
    schema: [],
    messages: {
      freshEmptyLiteral:
        'Zustand selector returns a fresh empty literal on every render — this triggers an infinite ' +
        're-render loop. Replace with a module-level const (e.g. `const EMPTY_ROSTER: readonly Role[] = []`) ' +
        'or pass a `shallow` / custom equality function as the second argument to the store hook.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isZustandHookCallee(node.callee)) return;

        const selector = node.arguments[0];
        if (selector === undefined) return;

        if (
          selector.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
          selector.type !== AST_NODE_TYPES.FunctionExpression
        ) {
          return;
        }

        if (hasEqualityArgument(node)) return;

        if (!selectorReturnsFreshEmpty(selector)) return;

        context.report({
          node: selector,
          messageId: 'freshEmptyLiteral',
        });
      },
    };
  },
});
