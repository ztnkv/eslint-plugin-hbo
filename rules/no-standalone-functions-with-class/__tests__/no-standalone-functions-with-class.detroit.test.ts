import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-standalone-functions-with-class.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-standalone-functions-with-class', rule, {
  valid: [
    {
      name: 'class without any functions — valid',
      code: 'class Foo {}',
    },

    {
      name: 'class plus interface and type alias — valid',
      code: ['interface Bar { x: number }', 'type Baz = number;', 'class Foo {}'].join('\n'),
    },

    {
      name: 'class with methods (not top-level functions) — valid',
      code: ['class Foo {', '  greet() { return 1; }', '}'].join('\n'),
    },

    {
      name: 'file without any class — rule stays silent even if functions are present',
      code: ['function helper() {}', 'const arrow = () => 1;'].join('\n'),
    },

    {
      name: 'function nested inside a method of the class — valid',
      code: ['class Foo {', '  greet() { function inner() {} return inner; }', '}'].join('\n'),
    },

    {
      name: 'class expression assigned to const with no other functions — valid',
      code: 'const Foo = class {};',
    },

    {
      name: 'file with only non-function variables — rule stays silent',
      code: ['class Foo {}', 'const value = 42;'].join('\n'),
    },
  ],

  invalid: [
    {
      name: 'class plus top-level function declaration — invalid',
      code: ['class Foo {}', 'function helper() {}'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus exported function declaration — invalid',
      code: ['class Foo {}', 'export function helper() {}'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus top-level arrow function in const — invalid',
      code: ['class Foo {}', 'const helper = () => 1;'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus top-level function expression in const — invalid',
      code: ['class Foo {}', 'const helper = function () { return 1; };'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus default-exported arrow function — invalid',
      code: ['class Foo {}', 'export default () => 1;'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus two top-level helpers — two errors',
      code: ['class Foo {}', 'function helperA() {}', 'const helperB = () => 1;'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }, { messageId: 'standaloneFunction' }],
    },

    {
      name: 'class expression in const plus standalone function — invalid',
      code: ['const Foo = class {};', 'function helper() {}'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },

    {
      name: 'class plus default-exported function declaration — invalid',
      code: ['class Foo {}', 'export default function helper() {}'].join('\n'),
      errors: [{ messageId: 'standaloneFunction' }],
    },
  ],
});
