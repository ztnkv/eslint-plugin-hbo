import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const FIRST_EXTRA_CLASS_INDEX = 1;

function unwrapExport(node: TSESTree.ProgramStatement): TSESTree.Node | null {
  if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    return node.declaration;
  }

  if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    return node.declaration;
  }

  return node;
}

function isClassNode(node: TSESTree.Node | null): node is TSESTree.ClassDeclaration | TSESTree.ClassExpression {
  if (node === null) return false;

  return node.type === AST_NODE_TYPES.ClassDeclaration || node.type === AST_NODE_TYPES.ClassExpression;
}

function collectTopLevelClasses(
  body: TSESTree.ProgramStatement[],
): (TSESTree.ClassDeclaration | TSESTree.ClassExpression)[] {
  const classes: (TSESTree.ClassDeclaration | TSESTree.ClassExpression)[] = [];

  for (const statement of body) {
    const unwrapped = unwrapExport(statement);

    if (isClassNode(unwrapped)) {
      classes.push(unwrapped);
      continue;
    }

    if (unwrapped?.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const declarator of unwrapped.declarations) {
        if (isClassNode(declarator.init)) {
          classes.push(declarator.init);
        }
      }
    }
  }

  return classes;
}

export const rule = createRule({
  name: 'no-multiple-classes-per-file',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow defining more than one top-level class per file.',
    },
    schema: [],
    messages: {
      extraClass:
        'Only one top-level class per file is allowed. Move this class into its own file (hbo/no-multiple-classes-per-file).',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const classes = collectTopLevelClasses(program.body);

        for (let i = FIRST_EXTRA_CLASS_INDEX; i < classes.length; i++) {
          const extra = classes[i];
          if (!extra) continue;

          context.report({
            node: extra,
            messageId: 'extraClass',
          });
        }
      },
    };
  },
});
