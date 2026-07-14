import { expect, type Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/cart");
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectVisible() {
    // Use the cart page heading — avoid matching the off-canvas drawer "Your bag"
    // or nav "Cart" links (those create flaky/strict locator failures).
    await expect(
      this.page.getByRole("heading", { name: /shopping cart/i }),
    ).toBeVisible({ timeout: 15_000 });
  }
}
