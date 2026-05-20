import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

export function collectTopLevelDeclarations(
  program: TSESTree.Program,
  factoryPattern: RegExp,
): Map<string, TSESTree.Identifier> {
  const declarations = new Map<string, TSESTree.Identifier>();

  for (const statement of program.body) {
    const unwrapped = unwrapExportDeclaration(statement);

    for (const identifier of collectDeclaredIdentifiers(unwrapped)) {
      if (factoryPattern.test(identifier.name)) continue;

      declarations.set(identifier.name, identifier);
    }
  }

  return declarations;
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
