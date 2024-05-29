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

import {test,expect} from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('Load app list after admin log in', async ({ page }) => {
    await page.goto('https://devtronurl:32443/dashboard/app/list/d');
    // Expect App name to be visible
    await expect(page.getByRole('button', {name: 'App name'})).toBeVisible();
  });