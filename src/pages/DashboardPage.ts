import { Locator, Page } from '@playwright/test';

import { UiMessages } from '@constants/messages';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly dashboardHeader: Locator;
  private readonly userDropdown: Locator;
  private readonly profileMenu: Locator;
  private readonly logoutMenuItem: Locator;
  private readonly sidePanel: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeader = page.locator('h6.oxd-text.oxd-text--h6');
    this.userDropdown = page.locator('.oxd-userdropdown-name');
    this.profileMenu = page.locator('.oxd-dropdown-menu');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
    this.sidePanel = page.locator('.oxd-sidepanel');
  }

  public async isDashboardLoaded(): Promise<boolean> {
    const isHeaderVisible = await this.isVisible(this.dashboardHeader);
    const headerText = await this.getText(this.dashboardHeader);
    const isSidePanelVisible = await this.isVisible(this.sidePanel);

    return (
      isHeaderVisible &&
      isSidePanelVisible &&
      headerText === UiMessages.DASHBOARD_TITLE
    );
  }

  public async getHeaderText(): Promise<string> {
    return this.getText(this.dashboardHeader);
  }

  public async logout(): Promise<void> {
    await this.clickElement(this.userDropdown);
    await this.waitForElement(this.profileMenu);
    await this.clickElement(this.logoutMenuItem);
  }
}
