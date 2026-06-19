import { expect, test } from "../fixtures/admin-test";
import { requireE2E } from "../fixtures/env";
import { AdminCategoriesPage } from "../pages/admin/categories.page";

test.describe("Admin — categories", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("lists Women and Girls taxonomy categories", async ({ page }) => {
    const categories = new AdminCategoriesPage(page);
    await categories.goto();
    await categories.expectTaxonomyCategoriesVisible();
    await expect(page.getByText("Women and Girls taxonomy only")).toBeVisible();
  });
});
