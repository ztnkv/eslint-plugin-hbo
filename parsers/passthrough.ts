import type { Linter } from 'eslint';

// A deliberately minimal parser whose only job is to bring otherwise-unparsed
// files (e.g. `.sql` migrations) into ESLint's lint set. It never produces a
// real AST — every input becomes an empty `Program` — so the only rules that
// can act on these files are ones that work purely off `context.filename` and
// the filesystem (see `migration-must-have-test`).
export const passthrough: Linter.Parser = {
  meta: {
    name: 'hbo-passthrough-parser',
    version: '1.0.0',
  },

  parseForESLint(code: string) {
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1] ?? '';

    return {
      ast: {
        type: 'Program' as const,
        body: [],
        sourceType: 'module' as const,
        comments: [],
        tokens: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: lines.length, column: lastLine.length },
        },
        range: [0, code.length] as [number, number],
      },
    };
  },
};
