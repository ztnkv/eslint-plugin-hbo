import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-multiple-classes-per-file.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-multiple-classes-per-file', rule, {
  valid: [
    {
      name: 'single class declaration — valid',
      code: 'class Foo {}',
    },

    {
      name: 'single exported class — valid',
      code: 'export class Foo {}',
    },

    {
      name: 'single default-exported class — valid',
      code: 'export default class Foo {}',
    },

    {
      name: 'class plus interface — valid',
      code: ['interface Bar { x: number }', 'class Foo {}'].join('\n'),
    },

    {
      name: 'class plus type alias — valid',
      code: ['type Bar = number;', 'class Foo {}'].join('\n'),
    },

    {
      name: 'inner class nested inside a function — only top-level counts',
      code: ['class Foo {}', 'function build() { return class Inner {}; }'].join('\n'),
    },

    {
      name: 'no classes at all — valid',
      code: 'const value = 1;',
    },
  ],

  invalid: [
    {
      name: 'two class declarations — invalid',
      code: ['class Foo {}', 'class Bar {}'].join('\n'),
      errors: [{ messageId: 'extraClass' }],
    },

    {
      name: 'class declaration plus default-exported class — invalid',
      code: ['class Foo {}', 'export default class Bar {}'].join('\n'),
      errors: [{ messageId: 'extraClass' }],
    },

    {
      name: 'class declaration plus exported class — invalid',
      code: ['class Foo {}', 'export class Bar {}'].join('\n'),
      errors: [{ messageId: 'extraClass' }],
    },

    {
      name: 'class declaration plus top-level class expression in const — invalid',
      code: ['class Foo {}', 'const Bar = class {};'].join('\n'),
      errors: [{ messageId: 'extraClass' }],
    },

    {
      name: 'three class declarations — two errors',
      code: ['class Foo {}', 'class Bar {}', 'class Baz {}'].join('\n'),
      errors: [{ messageId: 'extraClass' }, { messageId: 'extraClass' }],
    },
  ],
});
