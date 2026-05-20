import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

type FunctionLikeNode = TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

function unwrapExport(node: TSESTree.ProgramStatement): TSESTree.Node | null {
  if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    return node.declaration;
  }

  if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    return node.declaration;
  }

  return node;
}

function isClassNode(node: TSESTree.Node | null): boolean {
  if (node === null) return false;

  return node.type === AST_NODE_TYPES.ClassDeclaration || node.type === AST_NODE_TYPES.ClassExpression;
}

function isFunctionLike(node: TSESTree.Node | null | undefined): node is FunctionLikeNode {
  if (node === null || node === undefined) return false;

  return (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.FunctionExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

function hasTopLevelClass(body: TSESTree.ProgramStatement[]): boolean {
  for (const statement of body) {
    const unwrapped = unwrapExport(statement);

    if (isClassNode(unwrapped)) return true;

    if (unwrapped?.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const declarator of unwrapped.declarations) {
        if (isClassNode(declarator.init)) return true;
      }
    }
  }

  return false;
}

function collectStandaloneFunctions(body: TSESTree.ProgramStatement[]): TSESTree.Node[] {
  const functions: TSESTree.Node[] = [];

  for (const statement of body) {
    const unwrapped = unwrapExport(statement);

    if (unwrapped?.type === AST_NODE_TYPES.FunctionDeclaration) {
      functions.push(unwrapped);
      continue;
    }

    if (statement.type === AST_NODE_TYPES.ExportDefaultDeclaration && isFunctionLike(statement.declaration)) {
      functions.push(statement.declaration);
      continue;
    }

    if (unwrapped?.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const declarator of unwrapped.declarations) {
        if (isFunctionLike(declarator.init)) {
          functions.push(declarator.init);
        }
      }
    }
  }

  return functions;
}

export const rule = createRule({
  name: 'no-standalone-functions-with-class',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow top-level standalone functions in a file that defines a top-level class. Class-files must contain only the class itself (plus types and interfaces).',
    },
    schema: [],
    messages: {
      standaloneFunction:
        'Standalone top-level function in a class-file. Move it into its own module or convert to a class method (hbo/no-standalone-functions-with-class).',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        if (!hasTopLevelClass(program.body)) return;

        const functions = collectStandaloneFunctions(program.body);

        for (const fn of functions) {
          context.report({
            node: fn,
            messageId: 'standaloneFunction',
          });
        }
      },
    };
  },
});
