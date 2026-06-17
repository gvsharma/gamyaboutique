import { expect, type Page } from "@playwright/test";

export class AccountAddressesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/account/addresses");
    await expect(this.page.getByRole("heading", { name: "Saved addresses" })).toBeVisible({
      timeout: 20_000,
    });
  }

  async addAddress(input: { line1: string; city: string; state?: string; pincode?: string }) {
    await this.page.getByLabel("Address line").fill(input.line1);
    await this.page.getByLabel("City").fill(input.city);
    if (input.state) await this.page.getByLabel("State").fill(input.state);
    if (input.pincode) await this.page.getByLabel("Pincode").fill(input.pincode);
    await this.page.getByRole("button", { name: "Add address" }).click();
    await expect(this.page.getByText(input.line1)).toBeVisible({ timeout: 15_000 });
  }
}
