import { test as base } from "@playwright/test";
import { requireE2E } from "./env";
import { AuthPage } from "../pages/auth.page";

export const test = base.extend({
  authenticatedCustomer: async ({ page }, use) => {
    if (!requireE2E()) {
      await use({ email: "", password: "" });
      return;
    }

    const unique = Date.now();
    const email = `e2e-customer+${unique}@example.com`;
    const password = "Valid1!pass";
    const auth = new AuthPage(page);
    await auth.registerAccount({
      firstName: "E2E",
      lastName: "Customer",
      email,
      password,
    });
    await use({ email, password });
  },
});

export { expect } from "@playwright/test";
