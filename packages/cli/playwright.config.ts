import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

// 根据环境变量决定是否需要进行认证
const authMode = process.env.AUTH === '1' || process.env.AUTH === 'true';

// 配置
const config: PlaywrightTestConfig = {
  // 测试目录配置
  testDir: './src/commands/base',
  testMatch: 'copyCookieTest.ts',
  // 最大并发数
  workers: 1,
  // 测试超时时间
  timeout: 5 * 60 * 1000, // 5分钟
  // 重试次数
  retries: 0,
  // 报告和输出配置
  reporter: 'list',
  // 项目配置
  projects: [
    {
      name: 'auth-setup',
      testMatch: /copyCookieTest\.ts/,
      use: {
        // 浏览器配置
        browserName: 'chromium',
        headless: false,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        // 截图配置
        screenshot: 'on',
        // 记录video
        video: 'on-first-retry',
        // 追踪配置
        trace: 'on-first-retry',
        // 自动下载权限
        permissions: ['geolocation'],
        // 浏览器参数
        launchOptions: {
          args: [
            '--disable-web-security', 
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled'
          ],
          slowMo: 100, // 减缓操作速度，更像真人操作
        }
      },
    }
  ],
  // 使用已有的存储状态
  use: {
    // 从保存的认证状态加载
    storageState: authMode ? undefined : path.join(__dirname, 'playwright/.auth/cnblogs.json'),
  },
};

export default config; 