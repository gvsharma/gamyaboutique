import { expect, test } from "../fixtures/admin-test";
import { requireE2E } from "../fixtures/env";

/** Every item in admin-shell nav — smoke that page shell + heading loads. */
const ADMIN_PAGES: { path: string; heading: RegExp }[] = [
  { path: "/admin", heading: /dashboard/i },
  { path: "/admin/products", heading: /products/i },
  { path: "/admin/products/new", heading: /quick add product|new product/i },
  { path: "/admin/products/import", heading: /import products from csv/i },
  { path: "/admin/categories", heading: /categories/i },
  { path: "/admin/users", heading: /users/i },
  { path: "/admin/customers", heading: /customers/i },
  { path: "/admin/carts", heading: /carts/i },
  { path: "/admin/wishlists", heading: /wishlists/i },
  { path: "/admin/interests", heading: /interests/i },
  { path: "/admin/leads", heading: /leads/i },
  { path: "/admin/taxonomy", heading: /taxonomy/i },
  { path: "/admin/promo-videos", heading: /homepage promo videos/i },
  { path: "/admin/policies", heading: /site policies/i },
];

test.describe("Admin — navigation smoke", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  for (const { path, heading } of ADMIN_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText("Gamya Couture Admin")).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText(/failed to load|something went wrong/i)).toHaveCount(0);
    });
  }

  test("sidebar links match all primary routes", async ({ page }) => {
    await page.goto("/admin");
    const nav = page.locator("aside nav");
    for (const label of [
      "Dashboard",
      "Products",
      "Categories",
      "Users",
      "Customers",
      "Carts",
      "Wishlists",
      "Interests",
      "Leads",
      "Taxonomy",
      "Promo videos",
      "Policies",
    ]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });
});
