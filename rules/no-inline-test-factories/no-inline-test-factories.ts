import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

const FACTORY_NAME_PATTERN = /^(make|create|build|arrange)[A-Z]|^(Fake|Mock)[A-Z]/;

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

export const rule = createRule({
  name: 'no-inline-test-factories',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Test factory declarations (make*, create*, build*, arrange*, Fake*, Mock*) must live in __test-support__/, not inline in *.test.ts files.',
    },
    schema: [],
    messages: {
      inlineFactory:
        "Test factory '{{name}}' must live in __test-support__/, not inline in *.test.ts. See docs/mvp/testing.md §6.3 Принцип 4.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        for (const statement of program.body) {
          reportIfFactoryDeclaration(statement, context);
        }
      },
    };
  },
});

type RuleContext = Parameters<typeof rule.create>[0];

function reportIfFactoryDeclaration(node: TSESTree.ProgramStatement, context: RuleContext): void {
  const unwrapped = unwrapExportDeclaration(node);
  if (unwrapped === null) return;

  for (const identifier of collectDeclaredIdentifiers(unwrapped)) {
    if (!FACTORY_NAME_PATTERN.test(identifier.name)) continue;

    context.report({
      node: identifier,
      messageId: 'inlineFactory',
      data: { name: identifier.name },
    });
  }
}

function unwrapExportDeclaration(node: TSESTree.ProgramStatement): TSESTree.Node | null {
  if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    return node.declaration;
  }

  if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    return node.declaration;
  }

  return node;
}

function collectDeclaredIdentifiers(node: TSESTree.Node | null): TSESTree.Identifier[] {
  if (node === null) return [];

  if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
    return node.id === null ? [] : [node.id];
  }

  if (node.type === AST_NODE_TYPES.ClassDeclaration) {
    return node.id === null ? [] : [node.id];
  }

  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    return collectFunctionInitDeclarators(node);
  }

  return [];
}

function collectFunctionInitDeclarators(node: TSESTree.VariableDeclaration): TSESTree.Identifier[] {
  const identifiers: TSESTree.Identifier[] = [];

  for (const declarator of node.declarations) {
    if (declarator.id.type !== AST_NODE_TYPES.Identifier) continue;
    if (!isFunctionInit(declarator.init)) continue;

    identifiers.push(declarator.id);
  }

  return identifiers;
}

function isFunctionInit(init: TSESTree.Expression | null | undefined): boolean {
  if (init === null || init === undefined) return false;

  return init.type === AST_NODE_TYPES.ArrowFunctionExpression || init.type === AST_NODE_TYPES.FunctionExpression;
}
