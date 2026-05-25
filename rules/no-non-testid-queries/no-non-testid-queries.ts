import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const DEFAULT_ATTRIBUTE = 'data-testid';

const DEFAULT_INCLUDE_MULTIPLE = false;

const DEFAULT_ALLOW_DYNAMIC_SELECTORS = true;

const DEFAULT_ALLOWED_METHODS: string[] = [];

// Testing Library / Playwright element queries: get/query/findBy<Suffix>, with an
// optional `All` for the multi-element variants. The captured suffix decides the verdict.
const BY_QUERY_RE = /^(get|query|find)(All)?By([A-Z]\w*)$/;

// The one suffix that is allowed — getByTestId, queryAllByTestId, page.getByTestId, …
const TEST_ID_SUFFIX = 'TestId';

// DOM single-element selectors that take a CSS string and may legitimately target testid.
const STRING_SELECTOR_SINGLE = new Set(['querySelector', 'closest', 'locator', '$']);

// DOM multi-element selectors that take a CSS string.
const STRING_SELECTOR_MULTIPLE = new Set(['querySelectorAll', '$$']);

// Native DOM lookups by id / class / tag / name — never a testid, so always flagged.
const DOM_SINGLE = new Set(['getElementById']);

const DOM_MULTIPLE = new Set(['getElementsByClassName', 'getElementsByTagName', 'getElementsByName']);

// Cypress methods that only make sense as element selection — guarded by a `cy` chain root
// so we don't trip on Map.get / axios.get and friends. `contains` selects by visible text.
const CY_STRING_SELECTOR_SINGLE = new Set(['get']);

const CY_TEXT_SELECTOR = new Set(['contains']);

type Options = [
  {
    attribute?: string;
    includeMultiple?: boolean;
    allowDynamicSelectors?: boolean;
    allowedMethods?: string[];
  },
];

type MessageId = 'nonTestIdQuery';

// Plain string value of an expression, or null when it isn't a bare literal:
// a string Literal, or a template string with no substitutions.
function stringLiteralValue(expression: TSESTree.Node): string | null {
  if (expression.type === AST_NODE_TYPES.Literal && typeof expression.value === 'string') {
    return expression.value;
  }

  if (expression.type === AST_NODE_TYPES.TemplateLiteral && expression.expressions.length === 0) {
    return expression.quasis[0]?.value.cooked ?? null;
  }

  return null;
}

// The method name being called plus the object it hangs off, for both `getByRole(...)`
// (destructured, Identifier callee) and `screen.getByRole(...)` (MemberExpression callee).
function calleeMethodName(callee: TSESTree.Expression): string | null {
  if (callee.type === AST_NODE_TYPES.Identifier) return callee.name;

  if (callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier) {
    return callee.property.name;
  }

  return null;
}

// Walks a member/call chain down to its leftmost identifier: the root of `cy.get(...).find(...)`
// is `cy`. Returns null when the chain bottoms out on something that isn't a bare identifier.
function chainRootName(callee: TSESTree.Expression): string | null {
  let current: TSESTree.Node = callee;

  for (;;) {
    if (current.type === AST_NODE_TYPES.MemberExpression) {
      current = current.object;
      continue;
    }

    if (current.type === AST_NODE_TYPES.CallExpression) {
      current = current.callee;
      continue;
    }

    break;
  }

  return current.type === AST_NODE_TYPES.Identifier ? current.name : null;
}

function buildSegmentMatcher(attribute: string): RegExp {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // A single attribute selector on the configured attribute: [data-testid], [data-testid=x],
  // [data-testid="x"], [data-testid^='x'], … and nothing else clinging to it.
  return new RegExp(`^\\[${escaped}(?:[~^$*|]?=(?:"[^"]*"|'[^']*'|[^\\]]+))?\\]$`);
}

export const rule = createRule<Options, MessageId>({
  name: 'no-non-testid-queries',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow selecting a single element by anything other than the testid attribute — no getByRole/getByText, no CSS class/id/tag selectors, only *ByTestId and [data-testid] queries.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          attribute: {
            type: 'string',
            description: 'The test-id attribute that selectors must target (default: data-testid).',
          },
          includeMultiple: {
            type: 'boolean',
            description: 'Also flag multi-element queries: getAllBy*, querySelectorAll, $$, getElementsBy*.',
          },
          allowDynamicSelectors: {
            type: 'boolean',
            description: 'Skip string-selector calls whose argument is not a static string (a variable or interpolated template).',
          },
          allowedMethods: {
            type: 'array',
            items: { type: 'string' },
            description: 'Method names that are never flagged (escape hatch).',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      nonTestIdQuery:
        "Select elements by '{{attribute}}', not via '{{method}}'. (hbo/no-non-testid-queries)",
    },
  },
  defaultOptions: [
    {
      attribute: DEFAULT_ATTRIBUTE,
      includeMultiple: DEFAULT_INCLUDE_MULTIPLE,
      allowDynamicSelectors: DEFAULT_ALLOW_DYNAMIC_SELECTORS,
      allowedMethods: DEFAULT_ALLOWED_METHODS,
    },
  ],
  create(context, [options]) {
    const attribute = options.attribute ?? DEFAULT_ATTRIBUTE;
    const includeMultiple = options.includeMultiple ?? DEFAULT_INCLUDE_MULTIPLE;
    const allowDynamicSelectors = options.allowDynamicSelectors ?? DEFAULT_ALLOW_DYNAMIC_SELECTORS;
    const allowedMethods = new Set(options.allowedMethods ?? DEFAULT_ALLOWED_METHODS);

    const segmentMatcher = buildSegmentMatcher(attribute);

    // A CSS selector counts as testid-only when every combinator-separated segment is a
    // bare [attribute] selector: '[data-testid="a"] [data-testid="b"]' passes, '.x' does not.
    function isTestIdSelector(selector: string): boolean {
      const trimmed = selector.trim();
      if (trimmed.length === 0) return false;

      const segments = trimmed.split(/\s*[>+~]\s*|\s+/);

      return segments.every((segment) => segmentMatcher.test(segment));
    }

    function report(node: TSESTree.Node, method: string): void {
      context.report({ node, messageId: 'nonTestIdQuery', data: { attribute, method } });
    }

    // A string-selector call: flagged unless its static argument resolves to a testid selector.
    function checkStringSelector(node: TSESTree.CallExpression, method: string, multiple: boolean): void {
      if (multiple && !includeMultiple) return;

      const firstArgument = node.arguments[0];
      if (firstArgument === undefined) return;

      const selector = stringLiteralValue(firstArgument);

      if (selector === null) {
        if (allowDynamicSelectors) return;

        report(node, method);

        return;
      }

      if (isTestIdSelector(selector)) return;

      report(node, method);
    }

    return {
      CallExpression(node) {
        const method = calleeMethodName(node.callee);
        if (method === null) return;

        if (allowedMethods.has(method)) return;

        const byQuery = BY_QUERY_RE.exec(method);
        if (byQuery !== null) {
          const suffix = byQuery[3];
          if (suffix === TEST_ID_SUFFIX) return;

          const multiple = byQuery[2] === 'All';
          if (multiple && !includeMultiple) return;

          report(node, method);

          return;
        }

        if (STRING_SELECTOR_SINGLE.has(method)) {
          checkStringSelector(node, method, false);

          return;
        }

        if (STRING_SELECTOR_MULTIPLE.has(method)) {
          checkStringSelector(node, method, true);

          return;
        }

        if (DOM_SINGLE.has(method)) {
          report(node, method);

          return;
        }

        if (DOM_MULTIPLE.has(method)) {
          if (!includeMultiple) return;

          report(node, method);

          return;
        }

        // Cypress methods share generic names (get/contains), so only fire on a `cy` chain.
        if (chainRootName(node.callee) !== 'cy') return;

        if (CY_STRING_SELECTOR_SINGLE.has(method)) {
          checkStringSelector(node, method, false);

          return;
        }

        if (CY_TEXT_SELECTOR.has(method)) {
          report(node, method);
        }
      },
    };
  },
});
