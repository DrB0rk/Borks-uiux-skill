import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium'},webServer:{command:'npm run components:dev',url:'http://127.0.0.1:4173/playground/',reuseExistingServer:!process.env.CI,timeout:60000}});
