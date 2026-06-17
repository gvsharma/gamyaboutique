import { expect, test } from "@playwright/test";
import { requireE2E } from "../fixtures/env";

test.describe("User — forgot password", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("shows generic confirmation after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email or phone").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset/i }).click();
    await expect(page.getByText(/if an account exists/i)).toBeVisible({ timeout: 10_000 });
  });
});
