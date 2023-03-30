import {test,expect} from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('Load app list after admin log in', async ({ page }) => {
    await page.goto('https://devtronurl:32443/dashboard/app/list/d');
    // Expect App name to be visible
    await expect(page.getByRole('button', {name: 'App name'})).toBeVisible();
  });