import { expect, test } from "../fixtures/admin-test";
import { requireE2E, uniqueSku } from "../fixtures/env";
import { AdminCategoriesPage } from "../pages/admin/categories.page";

test.describe("Admin — categories", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("lists categories and creates a new one", async ({ page }) => {
    const categories = new AdminCategoriesPage(page);
    await categories.goto();

    const slug = uniqueSku("e2e-cat").toLowerCase();
    const name = `E2E Category ${slug}`;
    await categories.createCategory({
      name,
      slug,
      description: "Playwright category",
    });

    await expect(page.getByText(slug)).toBeVisible();
  });
});
