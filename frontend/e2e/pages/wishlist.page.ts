import { expect, type Page } from "@playwright/test";

export class WishlistPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/wishlist");
  }

  async expectHasItems() {
    await expect(this.page.locator("article").first()).toBeVisible({ timeout: 15_000 });
  }

  async moveFirstItemToBag() {
    const card = this.page.locator("article").first();
    await card.hover();
    await card.getByRole("button", { name: "Add to bag" }).click();
  }
}
