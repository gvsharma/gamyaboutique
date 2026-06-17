import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test as setup } from "@playwright/test";
import { adminCredentials, requireE2E } from "./fixtures/env";
import { AuthPage } from "./pages/auth.page";

const authDir = path.join(__dirname, ".auth");
const adminAuthFile = path.join(authDir, "admin.json");

setup.describe.configure({ mode: "serial" });

setup("authenticate admin", async ({ page }) => {
  setup.skip(!requireE2E(), "Set E2E_RUN=1 and start backend + frontend");

  await mkdir(authDir, { recursive: true });

  const auth = new AuthPage(page);
  await auth.loginAsAdmin();
  await page.context().storageState({ path: adminAuthFile });
});

setup("authenticate customer (optional)", async ({ page }) => {
  setup.skip(!requireE2E(), "Set E2E_RUN=1 and start backend + frontend");

  const { customerCredentials } = await import("./fixtures/env");
  setup.skip(!customerCredentials.email, "Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD");

  const auth = new AuthPage(page);
  await auth.login(customerCredentials.email, customerCredentials.password);
  await page.context().storageState({ path: path.join(authDir, "customer.json") });
});
