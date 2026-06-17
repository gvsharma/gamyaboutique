import { test as base } from "@playwright/test";
import { requireE2E } from "./env";
import { AuthPage } from "../pages/auth.page";

export const test = base.extend({
  page: async ({ page }, use) => {
    if (requireE2E()) {
      const auth = new AuthPage(page);
      await auth.loginAsAdmin();
    }
    await use(page);
  },
});

export { expect } from "@playwright/test";
