import { expect, type Page } from "@playwright/test";

export class ShopPage {
  constructor(private readonly page: Page) {}

  async gotoShop() {
    await this.page.goto("/shop");
  }

  async openFirstProduct() {
    await this.gotoShop();
    const productLink = this.page.locator('a[href^="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 20_000 });
    await productLink.click();
    await expect(this.page).toHaveURL(/\/products\//);
  }

  async addFirstProductToBag() {
    await this.openFirstProduct();
    const sizeButton = this.page.getByRole("button", { name: /^M$/i }).first();
    if (await sizeButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await sizeButton.click();
    }
    const addButton = this.page.getByRole("button", { name: /add to bag/i }).first();
    await expect(addButton).toBeVisible({ timeout: 15_000 });
    await expect(addButton).toBeEnabled({ timeout: 5_000 });
    await addButton.click();
  }
}
