import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import { childNodes, findCallbackArgument } from '../../ast-helpers.js';

const TEST_BLOCK_NAMES = new Set(['it', 'test', 'beforeEach', 'afterEach']);

export function walkAndCount(
  node: TSESTree.Node,
  depth: number,
  names: Set<string>,
  counts: Map<string, number>,
): void {
  if (node.type === AST_NODE_TYPES.CallExpression && isTestBlockCallee(node.callee)) {
    visitTestBlockCall(node, depth, names, counts);

    return;
  }

  if (depth > 0) {
    const calleeName = extractCalleeName(node);

    if (calleeName !== null && names.has(calleeName)) {
      counts.set(calleeName, (counts.get(calleeName) ?? 0) + 1);
    }
  }

  for (const child of childNodes(node)) {
    walkAndCount(child, depth, names, counts);
  }
}

function visitTestBlockCall(
  node: TSESTree.CallExpression,
  depth: number,
  names: Set<string>,
  counts: Map<string, number>,
): void {
  const callback = findCallbackArgument(node);

  for (const argument of node.arguments) {
    const nextDepth = argument === callback ? depth + 1 : depth;
    walkAndCount(argument, nextDepth, names, counts);
  }

  walkAndCount(node.callee, depth, names, counts);
}

function extractCalleeName(node: TSESTree.Node): string | null {
  if (node.type === AST_NODE_TYPES.CallExpression && node.callee.type === AST_NODE_TYPES.Identifier) {
    return node.callee.name;
  }

  if (node.type === AST_NODE_TYPES.NewExpression && node.callee.type === AST_NODE_TYPES.Identifier) {
    return node.callee.name;
  }

  return null;
}

function isTestBlockCallee(callee: TSESTree.Node): boolean {
  if (callee.type === AST_NODE_TYPES.Identifier) {
    return TEST_BLOCK_NAMES.has(callee.name);
  }

  if (callee.type === AST_NODE_TYPES.MemberExpression && callee.object.type === AST_NODE_TYPES.Identifier) {
    return TEST_BLOCK_NAMES.has(callee.object.name);
  }

  if (
    callee.type === AST_NODE_TYPES.CallExpression &&
    callee.callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.callee.object.type === AST_NODE_TYPES.Identifier
  ) {
    return TEST_BLOCK_NAMES.has(callee.callee.object.name);
  }

  return false;
}
