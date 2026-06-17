import { expect, test } from "../fixtures/admin-test";
import { requireE2E } from "../fixtures/env";

test.describe("Admin — operations (read-only)", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("leads inbox loads", async ({ page }) => {
    await page.goto("/admin/leads");
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/loading leads|no leads found|failed to load leads/i).first(),
    ).toBeVisible();
  });

  test("interests inbox loads", async ({ page }) => {
    await page.goto("/admin/interests");
    await expect(page.getByRole("heading", { name: "Interests" })).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/loading interests|no interests found|failed to load interests/i).first(),
    ).toBeVisible();
  });

  test("customers and carts lists load", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible({ timeout: 20_000 });

    await page.goto("/admin/carts");
    await expect(page.getByRole("heading", { name: /carts/i })).toBeVisible({ timeout: 20_000 });
  });
});
