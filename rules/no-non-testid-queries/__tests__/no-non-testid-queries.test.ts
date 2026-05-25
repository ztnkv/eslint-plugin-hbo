import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { rule } from '../no-non-testid-queries.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

const ruleTester = new RuleTester();

ruleTester.run('no-non-testid-queries', rule, {
  valid: [
    {
      name: 'Testing Library getByTestId — valid',
      code: 'const el = screen.getByTestId("submit");',
    },

    {
      name: 'destructured getByTestId — valid',
      code: 'const { getByTestId } = render(component); getByTestId("submit");',
    },

    {
      name: 'queryByTestId — valid',
      code: 'const el = screen.queryByTestId("submit");',
    },

    {
      name: 'findByTestId — valid',
      code: 'const el = await screen.findByTestId("submit");',
    },

    {
      name: 'Playwright getByTestId — valid',
      code: 'const el = page.getByTestId("submit");',
    },

    {
      name: 'Playwright locator with testid selector — valid',
      code: 'const el = page.locator("[data-testid=\\"submit\\"]");',
    },

    {
      name: 'querySelector with testid selector — valid',
      code: 'const el = container.querySelector("[data-testid=submit]");',
    },

    {
      name: 'nested testid selectors via descendant combinator — valid',
      code: 'const el = container.querySelector("[data-testid=list] [data-testid=item]");',
    },

    {
      name: 'cy.get with testid selector — valid',
      code: 'cy.get("[data-testid=submit]");',
    },

    {
      name: 'getAllByRole is multi-element, off by default — valid',
      code: 'const els = screen.getAllByRole("button");',
    },

    {
      name: 'querySelectorAll is multi-element, off by default — valid',
      code: 'const els = container.querySelectorAll(".item");',
    },

    {
      name: 'getElementsByClassName is multi-element, off by default — valid',
      code: 'const els = document.getElementsByClassName("item");',
    },

    {
      name: 'Map.get is not a Cypress chain — valid',
      code: 'const value = cache.get("key");',
    },

    {
      name: 'Array.find is left alone — valid',
      code: 'const found = items.find((x) => x.id === 1);',
    },

    {
      name: 'dynamic selector is skipped by default — valid',
      code: 'const el = container.querySelector(selector);',
    },

    {
      name: 'interpolated template selector is skipped by default — valid',
      code: 'const el = container.querySelector(`.item-${id}`);',
    },

    {
      name: 'custom attribute via option — valid',
      code: 'const el = container.querySelector("[data-cy=submit]");',
      options: [{ attribute: 'data-cy' }],
    },

    {
      name: 'allowedMethods escape hatch — valid',
      code: 'const el = screen.getByRole("button");',
      options: [{ allowedMethods: ['getByRole'] }],
    },
  ],
  invalid: [
    {
      name: 'Testing Library getByRole — invalid',
      code: 'const el = screen.getByRole("button");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'destructured getByText — invalid',
      code: 'const { getByText } = render(component); getByText("Submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'queryByLabelText — invalid',
      code: 'const el = screen.queryByLabelText("Email");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'findByPlaceholderText — invalid',
      code: 'const el = await screen.findByPlaceholderText("Search");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'Playwright page.getByRole — invalid',
      code: 'const el = page.getByRole("button");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'Playwright locator with class selector — invalid',
      code: 'const el = page.locator(".submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'querySelector with class selector — invalid',
      code: 'const el = container.querySelector(".submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'querySelector with id selector — invalid',
      code: 'const el = container.querySelector("#submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'testid selector with extra class qualifier — invalid',
      code: 'const el = container.querySelector("[data-testid=submit].active");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'getElementById — invalid',
      code: 'const el = document.getElementById("submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'closest with class selector — invalid',
      code: 'const el = node.closest(".card");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'cy.get with class selector — invalid',
      code: 'cy.get(".submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'cy.contains selects by text — invalid',
      code: 'cy.contains("Submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'cy chain root reaches get through a call — invalid',
      code: 'cy.wait("@load").get(".submit");',
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'getAllByRole flagged when includeMultiple is on — invalid',
      code: 'const els = screen.getAllByRole("button");',
      options: [{ includeMultiple: true }],
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'querySelectorAll flagged when includeMultiple is on — invalid',
      code: 'const els = container.querySelectorAll(".item");',
      options: [{ includeMultiple: true }],
      errors: [{ messageId: 'nonTestIdQuery' }],
    },

    {
      name: 'dynamic selector flagged when allowDynamicSelectors is off — invalid',
      code: 'const el = container.querySelector(selector);',
      options: [{ allowDynamicSelectors: false }],
      errors: [{ messageId: 'nonTestIdQuery' }],
    },
  ],
});
