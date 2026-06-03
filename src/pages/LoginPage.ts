import { expect, Locator, Page } from '@playwright/test';

import { RoutePatterns } from '@constants/routes';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly userNameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly loginErrorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.userNameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.loginErrorAlert = page.locator('.oxd-alert-content-text');
  }

  public async navigateToLogin(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.waitForElement(this.userNameInput, 30_000);
  }

  public async login(username: string, password: string): Promise<void> {
    await this.fillText(this.userNameInput, username);
    await this.fillText(this.passwordInput, password);
    await this.clickElement(this.loginButton);
  }

  public async loginWithValidCredentials(
    username: string,
    password: string
  ): Promise<void> {
    await Promise.all([
      this.page.waitForURL(RoutePatterns.DASHBOARD, { timeout: 30_000 }),
      this.login(username, password),
    ]);
    await expect(this.page).toHaveURL(RoutePatterns.DASHBOARD);
  }

  public async getLoginErrorMessage(): Promise<string> {
    return this.getText(this.loginErrorAlert);
  }

  public async isLoginFormVisible(): Promise<boolean> {
    const isUserNameVisible = await this.isVisible(this.userNameInput);
    const isPasswordVisible = await this.isVisible(this.passwordInput);
    const isLoginButtonVisible = await this.isVisible(this.loginButton);

    return isUserNameVisible && isPasswordVisible && isLoginButtonVisible;
  }
}
