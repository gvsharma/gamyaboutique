import { test } from "@playwright/test";
import { requireE2E } from "../fixtures/env";
import { CartPage } from "../pages/cart.page";
import { ShopPage } from "../pages/shop.page";

test.describe("User — browse, cart, wishlist", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("browse shop, add to bag, open cart", async ({ page }) => {
    const shop = new ShopPage(page);
    const cart = new CartPage(page);
    await shop.addFirstProductToBag();
    await cart.goto();
    await cart.expectVisible();
  });
});
