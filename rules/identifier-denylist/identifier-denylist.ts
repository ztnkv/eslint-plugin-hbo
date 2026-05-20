import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { IDENTIFIER_DENYLIST_NOUNS } from './identifier-denylist-nouns.js';
import { IDENTIFIER_DENYLIST_SHORTHANDS } from './identifier-denylist-shorthands.js';
import { IDENTIFIER_DENYLIST_VERBS } from './identifier-denylist-verbs.js';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const DENYLIST_SET = new Set([
  ...IDENTIFIER_DENYLIST_NOUNS,
  ...IDENTIFIER_DENYLIST_SHORTHANDS,
  ...IDENTIFIER_DENYLIST_VERBS,
]);

function isDenied(name: string): boolean {
  return DENYLIST_SET.has(name.toLowerCase());
}

export const rule = createRule({
  name: 'identifier-denylist',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow generic identifier names that lack domain context.',
    },
    schema: [],
    messages: {
      identifierInDenylist: "Avoid generic identifier name '{{name}}'. Use a more specific, domain-descriptive name.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type === AST_NODE_TYPES.Identifier) reportIfDenied(context, node.id);
      },

      FunctionDeclaration(node) {
        if (node.id) reportIfDenied(context, node.id);
        checkParams(context, node.params);
      },

      FunctionExpression(node) {
        checkParams(context, node.params);
      },

      ArrowFunctionExpression(node) {
        checkParams(context, node.params);
      },

      MethodDefinition(node) {
        if (node.kind === 'constructor') return;

        if (node.key.type === AST_NODE_TYPES.Identifier) reportIfDenied(context, node.key);
      },

      PropertyDefinition(node) {
        if (node.key.type === AST_NODE_TYPES.Identifier) reportIfDenied(context, node.key);
      },
    };
  },
});

type DenylistRuleContext = Parameters<(typeof rule)['create']>[0];

function reportIfDenied(context: DenylistRuleContext, node: TSESTree.Identifier): void {
  if (isDenied(node.name)) {
    context.report({ node, messageId: 'identifierInDenylist', data: { name: node.name } });
  }
}

function checkParams(context: DenylistRuleContext, params: readonly TSESTree.Parameter[]): void {
  for (const param of params) {
    if (param.type === AST_NODE_TYPES.Identifier) reportIfDenied(context, param);
  }
}
