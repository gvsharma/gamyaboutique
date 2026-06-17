import { expect, type Locator, type Page } from "@playwright/test";

export class AdminCategoriesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin/categories");
    await expect(this.page.getByRole("heading", { name: "Categories" })).toBeVisible({
      timeout: 20_000,
    });
  }

  private fieldInForm(form: Locator, label: string): Locator {
    return form.locator("label", { hasText: label }).locator("xpath=..").locator("input, textarea, select").first();
  }

  async createCategory(input: { name: string; slug: string; description?: string }) {
    const form = this.page.locator("form").filter({ hasText: "Add category" });
    await this.fieldInForm(form, "Name").fill(input.name);
    await this.fieldInForm(form, "Slug (optional)").fill(input.slug);
    if (input.description) {
      await this.fieldInForm(form, "Description").fill(input.description);
    }
    await form.getByRole("button", { name: "Create category" }).click();
    await expect(this.page.getByText(input.name, { exact: true })).toBeVisible({ timeout: 15_000 });
  }
}
