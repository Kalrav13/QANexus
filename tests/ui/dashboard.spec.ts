import { test, expect } from '@fixtures/index';
import { AssertionMessages } from '@constants/messages';
import { TestTag, taggedDescribe, taggedTitle } from '@constants/testTags';

test.describe(taggedDescribe('Dashboard tests', TestTag.SMOKE, TestTag.UI), {
  tag: [TestTag.SMOKE, TestTag.UI],
}, () => {
  test(
    taggedTitle(
      'loads dashboard with saved authentication state',
      TestTag.CRITICAL,
      TestTag.SANITY
    ),
    { tag: [TestTag.CRITICAL, TestTag.SANITY, TestTag.SMOKE, TestTag.UI] },
    async ({ authenticatedDashboard }) => {
      await expect(
        await authenticatedDashboard.isDashboardLoaded(),
        AssertionMessages.DASHBOARD_LOADED
      ).toBe(true);
    }
  );
});
