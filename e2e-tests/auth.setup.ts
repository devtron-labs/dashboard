/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test as setup } from '@playwright/test';
import {expect} from '@playwright/test';

//for admin user
const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('https://devtronurl:32443/dashboard/');
  await page.getByRole('link', { name: 'Login as administrator' }).click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('adminpwd');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('button', {name: 'App name'})).toBeVisible();
  // End of authentication steps.

  await page.context().storageState({ path: adminAuthFile });
});

//for normal user
const userAuthFile = 'playwright/.auth/user.json';

setup('authenticate as normal user', async ({ page }) => {
  await page.goto('https://devtronurl:32443/dashboard/');
  await page.getByRole('link', { name: 'Login with google' }).click();
  await page.getByRole('textbox', { name: 'Email or phone' }).fill('someone@devtron.ai');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('somepwd');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.goto('https://devtronurl:32443/dasboard/app/list/d');
  await expect(page.getByRole('button', {name: 'App name'})).toBeVisible();
  // End of authentication steps.

  await page.context().storageState({ path: userAuthFile });
});
