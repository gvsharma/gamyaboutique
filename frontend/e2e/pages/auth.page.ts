import { expect, type Page } from "@playwright/test";
import { adminCredentials } from "../fixtures/env";

export class AuthPage {
  constructor(private readonly page: Page) {}

  async gotoLogin() {
    await this.page.goto("/login");
  }

  async gotoRegister() {
    await this.page.goto("/register");
  }

  async login(identifier: string, password: string) {
    await this.gotoLogin();
    await this.page.getByLabel("Email or phone").fill(identifier);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign in" }).click();
  }

  async loginAsAdmin() {
    await this.login(adminCredentials.email, adminCredentials.password);
    await expect(this.page).toHaveURL(/\/admin/, { timeout: 20_000 });
  }

  async registerAccount(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    await this.gotoRegister();
    await this.page.getByLabel("First name").fill(input.firstName);
    await this.page.getByLabel("Last name").fill(input.lastName);
    await this.page.getByLabel("Email (optional)").fill(input.email);
    await this.page.getByLabel("Password").fill(input.password);
    await this.page.getByRole("button", { name: "Create account" }).click();
    await expect(this.page).toHaveURL("/", { timeout: 20_000 });
  }
}
