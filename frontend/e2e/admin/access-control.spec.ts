import { expect, test } from "../fixtures/admin-test";
import { requireE2E } from "../fixtures/env";
import { AuthPage } from "../pages/auth.page";
import { AdminDashboardPage } from "../pages/admin/dashboard.page";

test.describe("Admin — access control", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("admin lands on dashboard after login", async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.expectLoaded();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("customer cannot access admin", async ({ browser }) => {
    const unique = Date.now();
    const email = `e2e-customer+${unique}@example.com`;
    const password = "Valid1!pass";

    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthPage(page);

    await auth.registerAccount({
      firstName: "Store",
      lastName: "Customer",
      email,
      password,
    });

    await page.goto("/admin");
    await expect(page).toHaveURL("/", { timeout: 20_000 });
    await context.close();
  });
});
