import { expect, test } from "../fixtures/customer-test";
import { requireE2E } from "../fixtures/env";
import { AccountAddressesPage } from "../pages/account.page";

test.describe("User — saved addresses", () => {
  test.skip(!requireE2E(), "Set E2E_RUN=1 to run browser E2E tests");

  test("add delivery address on account page", async ({ page, authenticatedCustomer }) => {
    void authenticatedCustomer;
    const addresses = new AccountAddressesPage(page);
    await addresses.goto();
    await addresses.addAddress({
      line1: "12 E2E Test Lane",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
    });
    await expect(page.getByText("Default")).toBeVisible();
  });
});
