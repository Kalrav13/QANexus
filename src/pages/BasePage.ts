import { Locator, Page } from '@playwright/test';

import { Logger } from '@utils/logger';

export abstract class BasePage {
  public readonly page: Page;
  private readonly pageName: string;

  protected constructor(page: Page) {
    this.page = page;
    this.pageName = this.constructor.name;
  }

  protected getLocator(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  public async waitForElement(
    locator: string | Locator,
    timeout = 10000
  ): Promise<Locator> {
    Logger.debug(`${this.pageName}: waiting for element`, {
      locator: this.describeLocator(locator),
      timeout,
    });
    const element = this.getLocator(locator);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  public async clickElement(locator: string | Locator, timeout = 10000): Promise<void> {
    Logger.debug(`${this.pageName}: clicking element`, {
      locator: this.describeLocator(locator),
    });
    const element = await this.waitForElement(locator, timeout);
    await element.click();
  }

  public async fillText(
    locator: string | Locator,
    value: string,
    timeout = 10000
  ): Promise<void> {
    Logger.debug(`${this.pageName}: filling element`, {
      locator: this.describeLocator(locator),
      valueLength: value.length,
    });
    const element = await this.waitForElement(locator, timeout);
    await element.fill(value);
  }

  public async getText(locator: string | Locator, timeout = 10000): Promise<string> {
    const element = await this.waitForElement(locator, timeout);
    const text = await element.textContent();
    return text?.trim() ?? '';
  }

  public async isVisible(locator: string | Locator, timeout = 5000): Promise<boolean> {
    const element = this.getLocator(locator);
    try {
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  public async takeScreenshot(fileName: string): Promise<void> {
    Logger.info(`${this.pageName}: saving screenshot`, { fileName });
    await this.page.screenshot({
      path: `reports/screenshots/${fileName}`,
      fullPage: true
    });
  }

  private describeLocator(locator: string | Locator): string {
    return typeof locator === 'string' ? locator : '<Locator>';
  }
}
