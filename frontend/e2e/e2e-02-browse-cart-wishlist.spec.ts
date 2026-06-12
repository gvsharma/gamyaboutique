import { expect, test } from "@playwright/test";

/**
 * E2E-02: Browse → Add cart → Wishlist
 * Uses guest cart (no login required for cart). Wishlist requires auth — uses env creds if set.
 */
test.describe("E2E-02 Browse cart and wishlist", () => {
  test.skip(!process.env.E2E_RUN, "Set E2E_RUN=1 to run browser E2E tests");

  test("browse shop, add to bag, open cart", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("link", { name: /view|product/i }).first().click({ timeout: 15_000 });
    await page.getByRole("button", { name: /add to bag/i }).first().click();
    await page.goto("/cart");
    await expect(page.getByText(/your bag|cart/i)).toBeVisible({ timeout: 10_000 });
  });

  test("wishlist add when logged in", async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD");

    await page.goto("/login");
    await page.getByLabel("Email or phone").fill(process.env.E2E_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });

    await page.goto("/shop");
    const productLink = page.locator('a[href^="/products/"]').first();
    await productLink.click({ timeout: 15_000 });
    const wishlistBtn = page.getByRole("button", { name: /wishlist|save/i }).first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await page.goto("/wishlist");
      await expect(page.locator("body")).toContainText(/wishlist|saved/i);
    }
  });
});
