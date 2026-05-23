// Shared source of truth for recognizing the style/category token in a test
// file name. Both `test-file-suffix-allowlist` and `no-test-file-name-mismatch`
// parse names through this module, so their verdicts can never disagree on a
// non-trivial name (the compound-suffix bug came from two separate parsers).

export const RECOGNIZED_TEST_STYLE_TOKENS = ['detroit', 'london', 'contract', 'security'] as const;

export type RecognizedTestStyleToken = (typeof RECOGNIZED_TEST_STYLE_TOKENS)[number];

const TEST_EXTENSIONS = ['.test.tsx', '.test.ts'] as const;

const recognizedTokenSet: ReadonlySet<string> = new Set(RECOGNIZED_TEST_STYLE_TOKENS);

export interface ParsedTestFileName {
  // Recognized style tokens sitting immediately before `.test.ts(x)`, in written
  // order. `[]` when the name carries no recognized token (plain `.test.ts`, or
  // not a test file at all). A length >= 2 is an illegal compound such as
  // `security.detroit` — exactly one token is allowed.
  styleTokens: RecognizedTestStyleToken[];
  // `<base>` with the full recognized tail stripped — the production unit name.
  // `null` when the name is not a recognized `<base>.<style>.test.ts(x)`.
  base: string | null;
  // The full recognized tail, e.g. `.security.test.ts` or `.security.detroit.test.ts`.
  // `null` when there is no recognized token. This is what both rules compare
  // against their suffix options, so a compound tail never matches a single-token
  // entry.
  recognizedTail: string | null;
  // The matched test extension (`.test.ts` or `.test.tsx`); `null` if neither.
  testExtension: string | null;
}

function isRecognizedToken(value: string): value is RecognizedTestStyleToken {
  return recognizedTokenSet.has(value);
}

export function parseTestFileName(fileName: string): ParsedTestFileName {
  const testExtension = TEST_EXTENSIONS.find((extension) => fileName.endsWith(extension)) ?? null;
  if (testExtension === null) {
    return { styleTokens: [], base: null, recognizedTail: null, testExtension: null };
  }

  const stem = fileName.slice(0, fileName.length - testExtension.length);
  const segments = stem.split('.');

  // Walk the trailing run of recognized tokens right-to-left so a compound like
  // `<base>.security.detroit` yields both tokens, not just the last one.
  let firstTokenIndex = segments.length;
  while (firstTokenIndex > 0) {
    const candidate = segments[firstTokenIndex - 1];
    if (candidate === undefined || !isRecognizedToken(candidate)) break;

    firstTokenIndex -= 1;
  }

  const styleTokens = segments.slice(firstTokenIndex).filter(isRecognizedToken);
  if (styleTokens.length === 0) {
    return { styleTokens: [], base: null, recognizedTail: null, testExtension };
  }

  const base = segments.slice(0, firstTokenIndex).join('.');
  const recognizedTail = `.${styleTokens.join('.')}${testExtension}`;

  return { styleTokens, base, recognizedTail, testExtension };
}
