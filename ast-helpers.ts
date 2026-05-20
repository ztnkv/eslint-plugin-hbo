import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

const SKIP_KEYS = new Set(['parent', 'loc', 'range']);

export function* childNodes(node: TSESTree.Node): Generator<TSESTree.Node> {
  for (const key of Object.keys(node) as (keyof typeof node)[]) {
    if (SKIP_KEYS.has(key)) continue;

    yield* childrenFromKey(node[key]);
  }
}

function* childrenFromKey(value: unknown): Generator<TSESTree.Node> {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (isAstNode(item)) yield item;
    }

    return;
  }

  if (isAstNode(value)) yield value;
}

export function isAstNode(value: unknown): value is TSESTree.Node {
  return value !== null && typeof value === 'object' && 'type' in value;
}

export function findCallbackArgument(
  node: TSESTree.CallExpression,
): TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression | null {
  for (let index = node.arguments.length - 1; index >= 0; index -= 1) {
    const argument = node.arguments[index];
    if (argument === undefined) continue;

    if (
      argument.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      argument.type === AST_NODE_TYPES.FunctionExpression
    ) {
      return argument;
    }
  }

  return null;
}
