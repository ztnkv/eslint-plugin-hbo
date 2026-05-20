import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const STANDARD_ERROR_CTORS = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'EvalError',
  'URIError',
  'ReferenceError',
]);

const DEFAULT_BASE_CLASS = 'HboError';

type Options = [{ baseClass?: string }];

function isStandardErrorConstructor(callee: TSESTree.Expression): boolean {
  if (callee.type !== AST_NODE_TYPES.Identifier) return false;

  return STANDARD_ERROR_CTORS.has(callee.name);
}

export const rule = createRule<Options, 'useDomainErrorDescendant'>({
  name: 'no-throw-standard-error',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow throwing standard error classes — always throw a descendant of the project base error class.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          baseClass: {
            type: 'string',
            description: 'Name of the project base error class that all thrown errors must descend from.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useDomainErrorDescendant:
        'Use a custom error extending {{ baseClass }} instead of a standard error class (hbo/no-throw-standard-error).',
    },
  },
  defaultOptions: [{ baseClass: DEFAULT_BASE_CLASS }],
  create(context, [options]) {
    const baseClass = options.baseClass ?? DEFAULT_BASE_CLASS;

    return {
      ThrowStatement(node) {
        const thrown = node.argument;
        if (thrown.type !== AST_NODE_TYPES.NewExpression) return;

        if (!isStandardErrorConstructor(thrown.callee)) return;

        context.report({
          node: thrown,
          messageId: 'useDomainErrorDescendant',
          data: { baseClass },
        });
      },
    };
  },
});
