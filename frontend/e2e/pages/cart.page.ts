import { expect, type Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/cart");
  }

  async expectVisible() {
    await expect(this.page.getByText(/your bag|cart/i)).toBeVisible({ timeout: 15_000 });
  }
}
