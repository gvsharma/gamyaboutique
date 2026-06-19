import { expect, test } from "@playwright/test";

const MARKETING_ROUTES = ["/", "/about", "/contact", "/privacy", "/shipping", "/returns", "/terms"];

const CATEGORY_ROUTES = [
  "/category/sarees",
  "/category/kurtas",
  "/category/lehengas",
  "/category/blouses",
  "/category/girls",
  "/category/girls-kurtas",
  "/category/girls-lehengas",
  // Legacy marketing slugs still resolve via category-slugs aliases
  "/category/silk-sarees",
  "/category/bridal-lehengas",
  "/category/kids-ethnic",
];

test.describe("Smoke — marketing and category routes", () => {
  test("marketing pages load with boutique decor", async ({ page }) => {
    for (const route of MARKETING_ROUTES) {
      await page.goto(route);
      await expect(page.locator(".boutique-decor")).toHaveCount(1);
      await expect(page.locator(".boutique-decor svg")).toHaveCount(8);
      await expect(page.getByRole("link", { name: "Gamya Couture", exact: true })).toBeVisible();
    }
  });

  test("header nav category links resolve", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main navigation" });

    await nav.getByRole("link", { name: "Women", exact: true }).hover();
    await nav.getByRole("link", { name: "Sarees", exact: true }).click();
    await expect(page).toHaveURL(/\/category\/sarees$/);
    await expect(page.getByRole("heading", { name: /sarees/i })).toBeVisible();

    await page.goto("/");
    await nav.getByRole("link", { name: "Women", exact: true }).hover();
    await nav.getByRole("link", { name: "Lehengas", exact: true }).click();
    await expect(page).toHaveURL(/\/category\/lehengas$/);

    await page.goto("/");
    await nav.getByRole("link", { name: "Girls", exact: true }).click();
    await expect(page).toHaveURL(/\/category\/girls$/);
  });

  test("category routes load without API error banner", async ({ page }) => {
    test.skip(!process.env.E2E_RUN, "Set E2E_RUN=1 when backend is required for category data");

    for (const route of CATEGORY_ROUTES) {
      await page.goto(route);
      await expect(page.getByText(/could not load this category/i)).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("brand images are served locally", async ({ page, request }) => {
    const brandAssets = [
      "/brand/hero-saree.jpg",
      "/brand/category-saree.jpg",
      "/brand/category-lehenga.jpg",
      "/brand/category-girls.jpg",
    ];

    for (const asset of brandAssets) {
      const response = await request.get(asset);
      expect(response.ok(), `Expected ${asset} to be available`).toBeTruthy();
    }

    await page.goto("/category/lehengas");
    const heroImage = page.locator("img").first();
    await expect(heroImage).toHaveAttribute("src", /\/brand\/|\/_next\/image/);
  });
});
