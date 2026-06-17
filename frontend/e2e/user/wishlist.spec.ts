import { expect, test } from "../fixtures/customer-test";
import { requireE2E } from "../fixtures/env";
import { CartPage } from "../pages/cart.page";
import { ShopPage } from "../pages/shop.page";
import { WishlistPage } from "../pages/wishlist.page";

test.describe("User — wishlist", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("save to wishlist and move first item to bag", async ({ page, authenticatedCustomer }) => {
    void authenticatedCustomer;

    const shop = new ShopPage(page);
    await shop.openFirstProduct();
    await page.getByRole("button", { name: /add to wishlist|save/i }).first().click();

    const wishlist = new WishlistPage(page);
    await wishlist.goto();
    await wishlist.expectHasItems();
    await wishlist.moveFirstItemToBag();

    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectVisible();
  });
});
