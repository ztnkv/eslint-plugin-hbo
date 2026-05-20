import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-empty-array-zustand-selector.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-empty-array-zustand-selector', rule, {
  valid: [
    {
      name: 'fallback to module-level const — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? EMPTY_ROSTER);',
    },

    {
      name: 'fallback to numeric primitive — valid',
      code: 'useOfficeStore((state) => state.count ?? 0);',
    },

    {
      name: 'fallback to string primitive — valid',
      code: "useOfficeStore((state) => state.name ?? '');",
    },

    {
      name: 'shallow as second argument — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? [], shallow);',
    },

    {
      name: 'custom equality function as second argument — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? [], (a, b) => a === b);',
    },

    {
      name: 'plain property access without fallback — valid',
      code: 'useOfficeStore((state) => state.deskPlacements);',
    },

    {
      name: 'non-store hook call — valid',
      code: 'useMemo((deps) => deps ?? []);',
    },

    {
      name: 'store hook called without selector — valid',
      code: 'useOfficeStore();',
    },

    {
      name: 'selector returns truthy literal — valid',
      code: 'useOfficeStore((state) => state.flag ?? true);',
    },

    {
      name: 'block body returns property without fallback — valid',
      code: 'useOfficeStore((state) => { return state.deskPlacements; });',
    },

    {
      name: 'fallback to non-empty array literal — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? [defaultDesk]);',
    },

    {
      name: 'fallback to non-empty object literal — valid',
      code: 'useOfficeStore((state) => state.byOfficeId ?? { default: true });',
    },

    {
      name: 'logical expression with && operator — valid',
      code: 'useOfficeStore((state) => state.isReady && state.deskPlacements);',
    },

    {
      name: 'first argument is not a function — valid',
      code: 'useOfficeStore(externalSelector);',
    },

    {
      name: 'function expression as equality argument — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? [], function (a, b) { return a === b; });',
    },

    {
      name: 'member expression as equality argument — valid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? [], Object.is);',
    },

    {
      name: 'member-expression callee (not a bare identifier) — valid',
      code: 'storeFactory.useOfficeStore((state) => state.deskPlacements ?? []);',
    },

    {
      name: 'block body with side-effect statement and plain return — valid',
      code: 'useOfficeStore((state) => { const x = state.deskPlacements; return x; });',
    },

    {
      name: 'block body with bare return — valid',
      code: 'useOfficeStore((state) => { if (state.empty) { return; } return state.deskPlacements; });',
    },
  ],

  invalid: [
    {
      name: 'expression body with ?? [] — invalid',
      code: 'useOfficeStore((state) => state.deskPlacements ?? []);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'block body with return ?? [] — invalid',
      code: 'useOfficeStore((state) => { return state.deskPlacements ?? []; });',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'expression body with || [] — invalid',
      code: 'useOfficeStore((state) => state.deskPlacements || []);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'ternary with empty array alternate — invalid',
      code: 'useOfficeStore((state) => state.deskPlacements ? state.deskPlacements : []);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'ternary with empty array consequent — invalid',
      code: 'useOfficeStore((state) => state.isEmpty ? [] : state.deskPlacements);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'direct return of empty array literal — invalid',
      code: 'useOfficeStore((state) => []);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'expression body with ?? {} — invalid',
      code: 'useOfficeStore((state) => state.byOfficeId ?? {});',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'direct return of empty object literal — invalid',
      code: 'useThemeStore((state) => ({}));',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'function expression selector with ?? [] — invalid',
      code: 'useOfficeStore(function (state) { return state.deskPlacements ?? []; });',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },

    {
      name: 'different store hook name — invalid',
      code: 'useInboxStore((state) => state.letters ?? []);',
      errors: [{ messageId: 'freshEmptyLiteral' }],
    },
  ],
});
