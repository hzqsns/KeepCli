import { test } from '@playwright/test'
import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import pc from 'picocolors'

// 获取日志记录器
function getLogger() {
    return {
        info: (message: string) => console.log(`${pc.green('INFO')} ${message}`),
        warn: (message: string) => console.log(`${pc.yellow('WARN')} ${message}`),
        error: (message: string) => console.log(`${pc.red('ERROR')} ${message}`)
    }
}

// 示例测试 - 使用预存的认证状态
test('使用已保存的认证状态访问博客园', async ({ page }) => {
    const logger = getLogger()

    // 访问需要认证的页面
    logger.info('使用已保存认证状态访问博客园首页...')
    await page.goto('https://www.cnblogs.com/')

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 截图检查登录状态
    await page.screenshot({ path: 'auth-state-test.png' })

    // 检查是否已登录
    const isLoggedIn = await page.evaluate(() => {
        // 检查常见的登录状态元素
        return !!(
            document.querySelector('.user-info') ||
            document.querySelector('.header-user') ||
            document.querySelector('.navbar-user') ||
            document.querySelector('#navbar_login_status')
        )
    })

    if (isLoggedIn) {
        logger.info(pc.green('✓ 验证成功，已使用保存的认证状态访问'))

        // 获取并展示当前用户信息
        const username = await page.evaluate(() => {
            const userElement = document.querySelector('.user-info, .header-user, .navbar-user a')
            return userElement ? userElement.textContent.trim() : '未知用户'
        })

        logger.info(`当前登录用户: ${username}`)
    } else {
        logger.error('❌ 验证失败，未检测到登录状态')
    }
})

// 导出命令
export function useCookieTest(program: Command) {
    return program
        .createCommand('useCookie')
        .description('使用已保存的博客园认证状态')
        .action(async () => {
            const logger = getLogger()
            logger.info(pc.bgCyan('尝试使用已保存的认证状态...'))

            try {
                // 检查认证文件是否存在
                const authFile = path.join(process.cwd(), 'playwright/.auth/cnblogs.json')

                if (fs.existsSync(authFile)) {
                    logger.info(`找到认证文件: ${authFile}`)

                    // 读取认证文件内容
                    const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'))
                    const cookieCount = authData.cookies ? authData.cookies.length : 0

                    logger.info(`认证文件包含 ${cookieCount} 个Cookie`)

                    // 提示用户如何运行测试
                    logger.info(pc.yellow('请运行以下命令测试认证状态:'))
                    logger.info(
                        pc.green('npx playwright test keep-cli/packages/cli/src/commands/base/useCookieTest.ts -c playwright.config.ts')
                    )
                } else {
                    logger.error(`未找到认证文件，请先运行 'keep cookieTest' 进行认证设置`)
                }
            } catch (error) {
                logger.error(`使用认证状态失败: ${error.message}`)
            }
        })
}
