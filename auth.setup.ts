import { test as setup } from '@playwright/test';

//for admin user
const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('devtronurl');
  await page.getByRole('link', {name: 'Login as administrator'}).click();
  await page.getByPlaceholder('Username').fill('adminusername');
  await page.getByPlaceholder('Password').fill('adminpwd');
  // End of authentication steps.

  await page.context().storageState({ path: adminAuthFile });
});

//for normal user
const userAuthFile = 'playwright/.auth/user.json';

setup('authenticate as normal user', async ({ page }) => {
  await page.goto('devtronurl');
  await page.getByRole('link', { name: 'Login with google' }).click();
  await page.getByRole('textbox', { name: 'Email or phone' }).fill('someusername');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('MyPassword');
  await page.getByRole('button', { name: 'Next' }).click();
  //await page.goto('https://accounts.google.co.in/accounts/SetSID?ssdc=1&sidt=ALWU2cv171kuRkNau2Hp0gSvKXnShuee/PBDWiUTROcjltrOm6plyzaaBluayd0nnkaLa5AfRvFd%2BGFqnLlwy7%2BkZ445U1GBtxlvmj8j1P%2BWJgZXJqHDbSahz6hHdLMd7hu8LIvL%2BHNoKdgDVsTc9hFbrT5D5KVBkNhC0nBCyfZIDsfQ6ENFqaxER35iJQZL3HhvMhXhWX/%2BexiR3C%2BdtP3ZJv3smPxhe90tIEpFloXti05tR2772IMdAOhW7CH7WXVI%2B8WRK3Jq7VfMrC4RETjYyneFEhlcD5rn81J1/daIpBZcyXsmQ9A3WhKlJ6rSOfmoEkFIWPxoaaGWlIdDS/gLd4ElZPKEv%2Bv1MqRA8CbdvG6rPLe7%2BvBY5QAe9cTdTTgeprcw332i/PMCNB%2BrS/Wn47scGFpAZonLbhQVIrS2lLiF%2B84kohCukfpnmrQmHrb9ZDgRw7R4&continue=https://accounts.google.com/signin/oauth/consent?authuser%3D0%26part%3DAJi8hAO0GoJ0MVShE6ClPifHPnpZGp1v39nLOfeAjgz2n01gAHeb7cwu9r_l1VjQWui91x1Ha7EwtkRPiTPZjD68q9-VIIdFCQE3mVpEDnuDliJYRAvRQCZap6O2IGHMkTdHwADCcsWJaLwX4raVyL7c-_Ico0iepq9eeo-G9skSBVHoLW8JvMj7AsFRJpBQ9XEli5Y_UeCk70soB_d8k4Q-zGqAXdsiNP0vOOCaCsTj8wt74ToGdio3jLkDsBP8P4hbd92miAfdyrXZ9watgWxjYKLM4uygw__Y3Wo1CksGj1acR_PyAqKQ-mL8gXg-Dk6rlevUl4jmWHn2k0WIyFyGJx0ol-K61lLMKoq3h-T4zf73RArwjnGkIO9YEoNZwb9gbjBBnRd_AQRHRuEe6lsd9XybND6x-W8mgERr6VBlZSCksfXu3HCE4YMr2KNfungyy2fwkent3v3yMZRiDSN3PewIxogIAA%26as%3DS705645268%253A1678279922700190%26client_id%3D767341395723-1np0vq1mclgkp30d1jblgd6501c1cb1g.apps.googleusercontent.com%26rapt%3DAEjHL4M1qHWzqsCEWu8iS6nsE9nwdz-eQSUyvv1rn8ehcXrMcPv2ZO1eERbod4ATCCSTY14XP59qvl_YQ9sDsU369tJJ3QXJWA%23&tcc=1');
  //await page.goto('https://accounts.google.co.in/accounts/SetSID');
  await page.goto('https://devtronurl/dashboard/');
  await page.goto('https://devtronurl/app/list');
  await page.goto('https://devtronurl/app/list/d');
  // End of authentication steps.

  await page.context().storageState({ path: userAuthFile });
});