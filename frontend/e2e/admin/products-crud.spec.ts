import { expect, test } from "../fixtures/admin-test";
import { requireE2E, uniqueSku } from "../fixtures/env";
import { AdminProductFormPage } from "../pages/admin/product-form.page";
import { AdminProductsPage } from "../pages/admin/products.page";
import { ShopPage } from "../pages/shop.page";

test.describe("Admin — product lifecycle", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("create draft product, publish, visible on shop", async ({ page }) => {
    const sku = uniqueSku();
    const name = `E2E Saree ${sku}`;

    const products = new AdminProductsPage(page);
    const form = new AdminProductFormPage(page);
    const shop = new ShopPage(page);

    await products.gotoNew();
    await form.fillDraftProduct({ sku, name, price: "4999" });
    await form.submitCreate();

    await products.goto();
    await products.search(sku);
    await products.expectProductVisible(name);
    await products.publishProductNamed(name);

    await shop.gotoShop();
    await page.getByPlaceholder(/search sarees/i).fill(name);
    await expect(page.getByText(name, { exact: true })).toBeVisible({ timeout: 20_000 });
  });
});
