import { expect, test } from "@playwright/test";

/**
 * E2E-01: Register → Login
 * Requires backend + frontend running. Not gated in CI (run manually before release).
 */
test.describe("E2E-01 Register and login", () => {
  test.skip(!process.env.E2E_RUN, "Set E2E_RUN=1 to run browser E2E tests");

  test("register new account then sign in", async ({ page }) => {
    const unique = Date.now();
    const email = `e2e+${unique}@example.com`;
    const password = "Valid1!pass";

    await page.goto("/register");
    await page.getByLabel("First name").fill("E2E");
    await page.getByLabel("Last name").fill("User");
    await page.getByLabel("Email (optional)").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
  });
});
