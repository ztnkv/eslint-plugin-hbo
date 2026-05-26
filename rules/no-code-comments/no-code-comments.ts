import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/ztnkv/eslint-plugin-hbo/tree/main/rules/${name}`);

const ALLOWED_DIRECTIVE_PREFIXES = [
  'eslint-disable-next-line',
  '@ts-expect-error',
] as const;

const TODO_TAGS = ['TODO', 'FIXME', 'FIX', 'HACK', 'NOTE', 'XXX', 'BUG'] as const;

const EMERGENCY_ESCAPE_PREFIX = '!';

function isAllowedTodoTag(body: string): boolean {
  return TODO_TAGS.some((tag) => {
    if (!body.startsWith(tag)) return false;

    const next = body.charAt(tag.length);

    return next === ':' || next === '(' || next === ' ' || next === '';
  });
}

function isAllowedComment(comment: TSESTree.Comment): boolean {
  const body = comment.value.trim();

  if (ALLOWED_DIRECTIVE_PREFIXES.some((prefix) => body.startsWith(prefix))) return true;

  if (isAllowedTodoTag(body)) return true;

  return body.startsWith(EMERGENCY_ESCAPE_PREFIX);
}

export const rule = createRule({
  name: 'no-code-comments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow code comments. The only permitted comments are: local next-line rule disables (`// eslint-disable-next-line ...`, `// @ts-expect-error ...`); todo-tags (`// TODO: ...`, `// FIXME: ...`, `// FIX: ...`, `// HACK: ...`, `// NOTE: ...`, `// XXX: ...`, `// BUG: ...`); and the emergency-escape form `// ! ...` for cases where a comment is genuinely unavoidable.',
    },
    schema: [],
    messages: {
      forbiddenComment:
        'Code comments are not allowed. Permitted forms: local next-line rule disables (eslint-disable-next-line, @ts-expect-error), todo-tags (TODO/FIXME/FIX/HACK/NOTE/XXX/BUG). If a comment is truly unavoidable, use the emergency-escape form: `// ! <reason>`.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          if (isAllowedComment(comment)) continue;

          context.report({
            loc: comment.loc,
            messageId: 'forbiddenComment',
          });
        }
      },
    };
  },
});
