import { rule as blankLineAfterGuardContinue } from './rules/blank-line-after-guard-continue/blank-line-after-guard-continue.js';
import { rule as blankLineAfterGuardReturn } from './rules/blank-line-after-guard-return/blank-line-after-guard-return.js';
import { rule as blankLineBeforeFinalReturn } from './rules/blank-line-before-final-return/blank-line-before-final-return.js';
import { rule as blockDoWhileBlankLines } from './rules/block-do-while-blank-lines/block-do-while-blank-lines.js';
import { rule as blockForBlankLines } from './rules/block-for-blank-lines/block-for-blank-lines.js';
import { rule as blockIfBlankLines } from './rules/block-if-blank-lines/block-if-blank-lines.js';
import { rule as blockSwitchBlankLines } from './rules/block-switch-blank-lines/block-switch-blank-lines.js';
import { rule as blockWhileBlankLines } from './rules/block-while-blank-lines/block-while-blank-lines.js';
import { rule as expectBlankLine } from './rules/expect-blank-line/expect-blank-line.js';
import { rule as identifierDenylist } from './rules/identifier-denylist/identifier-denylist.js';
import { rule as migrationMustHaveTest } from './rules/migration-must-have-test/migration-must-have-test.js';
import { rule as noCodeComments } from './rules/no-code-comments/no-code-comments.js';
import { rule as noEmptyArrayZustandSelector } from './rules/no-empty-array-zustand-selector/no-empty-array-zustand-selector.js';
import { rule as noHardcodedJsxLiterals } from './rules/no-hardcoded-jsx-literals/no-hardcoded-jsx-literals.js';
import { rule as noInlineTestFactories } from './rules/no-inline-test-factories/no-inline-test-factories.js';
import { rule as noMultilineComments } from './rules/no-multiline-comments/no-multiline-comments.js';
import { rule as noMultipleClassesPerFile } from './rules/no-multiple-classes-per-file/no-multiple-classes-per-file.js';
import { rule as noNonTestidQueries } from './rules/no-non-testid-queries/no-non-testid-queries.js';
import { rule as noReusableInlineTestHelpers } from './rules/no-reusable-inline-test-helpers/no-reusable-inline-test-helpers.js';
import { rule as noStandaloneFunctionsWithClass } from './rules/no-standalone-functions-with-class/no-standalone-functions-with-class.js';
import { rule as noTestFileNameMismatch } from './rules/no-test-file-name-mismatch/no-test-file-name-mismatch.js';
import { rule as noThrowStandardError } from './rules/no-throw-standard-error/no-throw-standard-error.js';
import { rule as objectLiteralPropertySpacing } from './rules/object-literal-property-spacing/object-literal-property-spacing.js';
import { rule as singleExpectPerTest } from './rules/single-expect-per-test/single-expect-per-test.js';
import { rule as testBodyAaaBlankLines } from './rules/test-body-aaa-blank-lines/test-body-aaa-blank-lines.js';
import { rule as testFileSuffixAllowlist } from './rules/test-file-suffix-allowlist/test-file-suffix-allowlist.js';
import { rule as testMatcherStyle } from './rules/test-matcher-style/test-matcher-style.js';

import { passthrough } from './parsers/passthrough.js';

const plugin = {
  meta: {
    name: '@deniszhitnyakov/eslint-plugin-hbo',
    version: '0.7.0',
  },

  parsers: {
    passthrough,
  },

  rules: {
    'blank-line-after-guard-continue': blankLineAfterGuardContinue,
    'expect-blank-line': expectBlankLine,
    'blank-line-after-guard-return': blankLineAfterGuardReturn,
    'blank-line-before-final-return': blankLineBeforeFinalReturn,
    'block-do-while-blank-lines': blockDoWhileBlankLines,
    'block-for-blank-lines': blockForBlankLines,
    'block-if-blank-lines': blockIfBlankLines,
    'block-switch-blank-lines': blockSwitchBlankLines,
    'block-while-blank-lines': blockWhileBlankLines,
    'identifier-denylist': identifierDenylist,
    'migration-must-have-test': migrationMustHaveTest,
    'no-code-comments': noCodeComments,
    'no-empty-array-zustand-selector': noEmptyArrayZustandSelector,
    'no-hardcoded-jsx-literals': noHardcodedJsxLiterals,
    'no-inline-test-factories': noInlineTestFactories,
    'no-multiline-comments': noMultilineComments,
    'no-multiple-classes-per-file': noMultipleClassesPerFile,
    'no-non-testid-queries': noNonTestidQueries,
    'no-reusable-inline-test-helpers': noReusableInlineTestHelpers,
    'no-standalone-functions-with-class': noStandaloneFunctionsWithClass,
    'no-test-file-name-mismatch': noTestFileNameMismatch,
    'no-throw-standard-error': noThrowStandardError,
    'object-literal-property-spacing': objectLiteralPropertySpacing,
    'single-expect-per-test': singleExpectPerTest,
    'test-body-aaa-blank-lines': testBodyAaaBlankLines,
    'test-file-suffix-allowlist': testFileSuffixAllowlist,
    'test-matcher-style': testMatcherStyle,
  },
};

export default plugin;
