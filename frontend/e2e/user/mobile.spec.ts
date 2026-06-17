import { expect, test } from "@playwright/test";
import { requireE2E } from "../fixtures/env";

test.describe("User — mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shop and cart usable on mobile", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: /shop/i })).toBeVisible();

    test.skip(!requireE2E(), "Set E2E_RUN=1 for cart flow");

    const productLink = page.locator('a[href^="/products/"]').first();
    await productLink.click({ timeout: 20_000 });
    await page.getByRole("button", { name: /add to bag/i }).first().click();
    await page.goto("/cart");
    await expect(page.getByText(/your bag|cart/i)).toBeVisible();
  });
});
