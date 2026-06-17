import { expect, test } from "@playwright/test";
import { customerCredentials, requireE2E } from "../fixtures/env";
import { AuthPage } from "../pages/auth.page";

test.describe("User — register and login", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("register new account then sign in", async ({ page }) => {
    const unique = Date.now();
    const email = `e2e+${unique}@example.com`;
    const password = "Valid1!pass";

    const auth = new AuthPage(page);
    await auth.registerAccount({
      firstName: "E2E",
      lastName: "User",
      email,
      password,
    });

    await auth.login(email, password);
    await expect(page).toHaveURL("/", { timeout: 20_000 });
  });

  test("wrong password shows generic error", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login("nobody@example.com", "WrongPass1!");
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test("wishlist when logged in", async ({ page }) => {
    test.skip(!customerCredentials.email, "Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD");

    const auth = new AuthPage(page);
    await auth.login(customerCredentials.email, customerCredentials.password);
    await expect(page).toHaveURL("/", { timeout: 20_000 });

    await page.goto("/shop");
    const productLink = page.locator('a[href^="/products/"]').first();
    await productLink.click({ timeout: 20_000 });
    const wishlistBtn = page.getByRole("button", { name: /wishlist|save/i }).first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await page.goto("/wishlist");
      await expect(page.locator("body")).toContainText(/wishlist|saved/i);
    }
  });
});
