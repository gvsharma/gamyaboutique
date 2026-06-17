import { expect, type Page } from "@playwright/test";

export class AdminDashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin");
  }

  async expectLoaded() {
    await expect(this.page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(this.page.getByText("Active products")).toBeVisible();
  }
}
