import { expect, type Locator, type Page } from "@playwright/test";

export class AdminProductFormPage {
  constructor(private readonly page: Page) {}

  private fieldByLabel(label: string): Locator {
    return this.page.locator("label", { hasText: label }).locator("xpath=..").locator("input, textarea, select").first();
  }

  async fillDraftProduct(input: { sku: string; name: string; price: string }) {
    await this.fieldByLabel("SKU").fill(input.sku);
    await this.fieldByLabel("Name").fill(input.name);
    await this.fieldByLabel("Price (INR)").fill(input.price);

    const categorySelect = this.fieldByLabel("Primary category");
    const options = categorySelect.locator("option:not([value=''])");
    if ((await options.count()) > 0) {
      const value = await options.first().getAttribute("value");
      if (value) await categorySelect.selectOption(value);
    }
  }

  async submitCreate() {
    await this.page.getByRole("button", { name: "Create product" }).click();
    await expect(this.page).toHaveURL(/\/admin\/products\/.+\/edit/, { timeout: 20_000 });
  }
}
