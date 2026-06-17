import { expect, test } from "@playwright/test";
import { requireE2E } from "../fixtures/env";
import { CartPage } from "../pages/cart.page";
import { ShopPage } from "../pages/shop.page";

test.describe("Smoke — critical storefront path", () => {
  test("home and shop navigation load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Gamya Couture", exact: true })).toBeVisible();
    await page.getByRole("link", { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/\/shop/);
  });

  test("login route responds", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login/);
  });

  test("guest browse → add to bag → cart", async ({ page }) => {
    test.skip(!requireE2E(), "Set E2E_RUN=1 with backend running");

    const shop = new ShopPage(page);
    const cart = new CartPage(page);
    await shop.addFirstProductToBag();
    await cart.goto();
    await cart.expectVisible();
  });

  test("unauthenticated admin redirects to login", async ({ page }) => {
    test.skip(!requireE2E(), "Set E2E_RUN=1 with backend running");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });
});
