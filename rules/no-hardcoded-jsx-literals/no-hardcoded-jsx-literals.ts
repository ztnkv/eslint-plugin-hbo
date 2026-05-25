import { AST_NODE_TYPES, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const DEFAULT_TRANSLATION_FUNCTION_NAMES = ['t'];

const DEFAULT_TRANSLATION_COMPONENT_NAMES = ['Trans'];

const DEFAULT_ALLOWED_STRINGS: string[] = [];

const DEFAULT_CHECK_ATTRIBUTES = false;

// Only consulted when checkAttributes is on; user-facing attributes worth localizing.
const DEFAULT_ATTRIBUTES = ['aria-label', 'title', 'placeholder', 'alt', 'label'];

// A trimmed string must carry at least this many Unicode letters to count as copy.
// Numbers, punctuation, whitespace and single glyphs fall below the bar and pass.
const DEFAULT_MIN_LETTERS = 2;

type Options = [
  {
    translationFunctionNames?: string[];
    translationComponentNames?: string[];
    allowedStrings?: string[];
    checkAttributes?: boolean;
    attributes?: string[];
    minLetters?: number;
  },
];

type MessageId = 'hardcodedText' | 'hardcodedAttribute';

function letterCount(text: string): number {
  const letters = text.match(/\p{L}/gu);

  return letters ? letters.length : 0;
}

function jsxElementName(name: TSESTree.JSXTagNameExpression): string | null {
  if (name.type === AST_NODE_TYPES.JSXIdentifier) return name.name;

  if (name.type === AST_NODE_TYPES.JSXMemberExpression) return jsxElementName(name.property);

  return null;
}

function attributeName(name: TSESTree.JSXAttribute['name']): string | null {
  if (name.type === AST_NODE_TYPES.JSXIdentifier) return name.name;

  return `${name.namespace.name}:${name.name.name}`;
}

// Plain string value of an expression, or null when it isn't a bare literal:
// a string Literal, or a template string with no substitutions.
function stringLiteralValue(expression: TSESTree.Expression | TSESTree.JSXEmptyExpression): string | null {
  if (expression.type === AST_NODE_TYPES.Literal && typeof expression.value === 'string') {
    return expression.value;
  }

  if (expression.type === AST_NODE_TYPES.TemplateLiteral && expression.expressions.length === 0) {
    return expression.quasis[0]?.value.cooked ?? null;
  }

  return null;
}

export const rule = createRule<Options, MessageId>({
  name: 'no-hardcoded-jsx-literals',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded user-facing string literals in JSX — visible copy must go through an i18n key, not be inlined.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          translationFunctionNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'i18n functions whose calls are already localized (e.g. t in {t("key")}).',
          },
          translationComponentNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'i18n components whose subtree is already localized (e.g. Trans).',
          },
          allowedStrings: {
            type: 'array',
            items: { type: 'string' },
            description: 'Exact trimmed strings that are never flagged.',
          },
          checkAttributes: {
            type: 'boolean',
            description: 'Also check user-facing string literals in the configured attributes.',
          },
          attributes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Attribute names to check when checkAttributes is true.',
          },
          minLetters: {
            type: 'integer',
            minimum: 1,
            description: 'Minimum Unicode letters a trimmed string needs to count as copy.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedText:
        'User-facing JSX text must use an i18n key, not a hardcoded literal. (hbo/no-hardcoded-jsx-literals)',
      hardcodedAttribute:
        "User-facing attribute '{{attribute}}' must use an i18n key, not a hardcoded literal. (hbo/no-hardcoded-jsx-literals)",
    },
  },
  defaultOptions: [
    {
      translationFunctionNames: DEFAULT_TRANSLATION_FUNCTION_NAMES,
      translationComponentNames: DEFAULT_TRANSLATION_COMPONENT_NAMES,
      allowedStrings: DEFAULT_ALLOWED_STRINGS,
      checkAttributes: DEFAULT_CHECK_ATTRIBUTES,
      attributes: DEFAULT_ATTRIBUTES,
      minLetters: DEFAULT_MIN_LETTERS,
    },
  ],
  create(context, [options]) {
    const translationFunctionNames = new Set(options.translationFunctionNames ?? DEFAULT_TRANSLATION_FUNCTION_NAMES);
    const translationComponentNames = new Set(options.translationComponentNames ?? DEFAULT_TRANSLATION_COMPONENT_NAMES);
    const allowedStrings = new Set(options.allowedStrings ?? DEFAULT_ALLOWED_STRINGS);
    const checkAttributes = options.checkAttributes ?? DEFAULT_CHECK_ATTRIBUTES;
    const attributes = new Set(options.attributes ?? DEFAULT_ATTRIBUTES);
    const minLetters = options.minLetters ?? DEFAULT_MIN_LETTERS;

    function isCopy(raw: string): boolean {
      const trimmed = raw.trim();
      if (trimmed.length === 0) return false;

      if (allowedStrings.has(trimmed)) return false;

      return letterCount(trimmed) >= minLetters;
    }

    function isInsideTranslationComponent(node: TSESTree.Node): boolean {
      for (let current = node.parent; current; current = current.parent) {
        if (current.type !== AST_NODE_TYPES.JSXElement) continue;

        const name = jsxElementName(current.openingElement.name);
        if (name !== null && translationComponentNames.has(name)) return true;
      }

      return false;
    }

    // The i18n escape hatch: {t('key')}, {i18n.t('key')} are already localized.
    function isTranslationCall(expression: TSESTree.Expression | TSESTree.JSXEmptyExpression): boolean {
      if (expression.type !== AST_NODE_TYPES.CallExpression) return false;

      const callee = expression.callee;
      if (callee.type === AST_NODE_TYPES.Identifier) return translationFunctionNames.has(callee.name);

      if (callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier) {
        return translationFunctionNames.has(callee.property.name);
      }

      return false;
    }

    return {
      JSXText(node) {
        if (isInsideTranslationComponent(node)) return;

        if (!isCopy(node.value)) return;

        context.report({ node, messageId: 'hardcodedText' });
      },

      JSXExpressionContainer(node) {
        const parentType = node.parent.type;
        const isChild = parentType === AST_NODE_TYPES.JSXElement || parentType === AST_NODE_TYPES.JSXFragment;
        if (!isChild) return;

        if (isInsideTranslationComponent(node)) return;

        if (isTranslationCall(node.expression)) return;

        const value = stringLiteralValue(node.expression);
        if (value === null) return;

        if (!isCopy(value)) return;

        context.report({ node, messageId: 'hardcodedText' });
      },

      JSXAttribute(node) {
        if (!checkAttributes) return;

        const name = attributeName(node.name);
        if (name === null || !attributes.has(name)) return;

        const valueNode = node.value;
        if (valueNode === null) return;

        let value: string | null = null;

        if (valueNode.type === AST_NODE_TYPES.Literal && typeof valueNode.value === 'string') {
          value = valueNode.value;
        } else if (valueNode.type === AST_NODE_TYPES.JSXExpressionContainer) {
          if (isTranslationCall(valueNode.expression)) return;

          value = stringLiteralValue(valueNode.expression);
        }

        if (value === null) return;

        if (!isCopy(value)) return;

        context.report({ node: valueNode, messageId: 'hardcodedAttribute', data: { attribute: name } });
      },
    };
  },
});
