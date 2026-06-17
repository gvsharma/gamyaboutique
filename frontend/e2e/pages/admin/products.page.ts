import { expect, type Page } from "@playwright/test";

export class AdminProductsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin/products");
  }

  async gotoNew() {
    await this.page.goto("/admin/products/new");
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: "Products" })).toBeVisible({
      timeout: 20_000,
    });
  }

  async search(query: string) {
    await this.page.getByPlaceholder("Search SKU or name").fill(query);
  }

  async expectProductVisible(name: string) {
    await expect(this.page.getByText(name, { exact: true })).toBeVisible({ timeout: 15_000 });
  }

  async publishProductNamed(name: string) {
    const row = this.page.locator("tr", { hasText: name });
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(row.getByText("ACTIVE")).toBeVisible({ timeout: 15_000 });
  }
}
