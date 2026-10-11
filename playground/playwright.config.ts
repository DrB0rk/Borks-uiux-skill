import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'firefox',use:{...devices['Desktop Firefox']}},
  {name:'webkit',use:{...devices['Desktop Safari']}}
 ],
 use:{baseURL:'http://127.0.0.1:4173'},
 webServer:{command:'npm run components:dev',url:'http://127.0.0.1:4173/playground/',reuseExistingServer:!process.env.CI,timeout:90000}
});