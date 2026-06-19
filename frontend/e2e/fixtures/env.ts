export const adminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL ?? process.env.E2E_EMAIL ?? "admin@gamyacouture.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? process.env.E2E_PASSWORD ?? "Admin@123",
};

export const customerCredentials = {
  email: process.env.E2E_CUSTOMER_EMAIL ?? process.env.E2E_EMAIL ?? "",
  password: process.env.E2E_CUSTOMER_PASSWORD ?? process.env.E2E_PASSWORD ?? "",
};

export function requireE2E(): boolean {
  return process.env.E2E_RUN === "1";
}

/** Prevent the first-visit support modal from blocking nav interactions in smoke tests. */
export async function suppressSupportNotice(page: { addInitScript: (fn: () => void) => Promise<void> }) {
  await page.addInitScript(() => {
    sessionStorage.setItem("gamya_support_notice_shown", "1");
  });
}

export function uniqueSku(prefix = "E2E"): string {
  return `${prefix}-${Date.now()}`;
}
