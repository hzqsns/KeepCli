import { test as setup } from '@playwright/test'
import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import pc from 'picocolors'
import prompts from 'prompts'

// 获取日志记录器
function getLogger() {
    return {
        info: (message: string) => console.log(`${pc.green('INFO')} ${message}`),
        warn: (message: string) => console.log(`${pc.yellow('WARN')} ${message}`),
        error: (message: string) => console.log(`${pc.red('ERROR')} ${message}`)
    }
}

// 获取用户凭据
async function getCredentials() {
    // 通过交互式提示获取凭据
    const credentials = await prompts([
        {
            type: 'text',
            name: 'username',
            message: '请输入博客园账号:',
            validate: value => (value.length > 0 ? true : '账号不能为空')
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入博客园密码:',
            validate: value => (value.length > 0 ? true : '密码不能为空')
        }
    ])

    if (!credentials.username || !credentials.password) {
        throw new Error('账号或密码未提供，操作已取消')
    }

    return credentials
}

// 确保认证目录存在
function ensureAuthDir() {
    const authDir = path.resolve(process.cwd(), 'playwright/.auth')
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }
    return authDir
}

// 设置认证过程
setup('authenticate for cnblogs', async ({ page }) => {
    const logger = getLogger()

    try {
        // 获取用户凭据
        const credentials = await getCredentials()

        // 访问博客园登录页面
        logger.info('正在访问博客园登录页面...')
        await page.goto('https://account.cnblogs.com/signin')

        // 等待页面加载完成
        await page.waitForTimeout(3000)

        // 截图页面状态
        await page.screenshot({ path: 'login-page.png' })
        logger.info('已保存登录页面截图')

        // 在页面内执行JavaScript填写表单和提交
        logger.info('正在填写登录表单...')

        // 等待用户名和密码输入框出现
        await page.waitForSelector('#mat-input-0, input[formcontrolname="username"]')
        await page.waitForSelector('#mat-input-1, input[formcontrolname="password"]')

        // 填写用户名和密码
        await page.evaluate(
            ({ username, password }) => {
                // 填写用户名
                const usernameInput = document.querySelector('#mat-input-0, input[formcontrolname="username"]') as HTMLInputElement
                if (usernameInput) {
                    usernameInput.value = username
                    usernameInput.dispatchEvent(new Event('input', { bubbles: true }))
                }

                // 填写密码
                const passwordInput = document.querySelector('#mat-input-1, input[formcontrolname="password"]') as HTMLInputElement
                if (passwordInput) {
                    passwordInput.value = password
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                }

                // 勾选"记住我"
                const rememberCheckbox = document.querySelector('.mat-checkbox-input') as HTMLInputElement
                if (rememberCheckbox && !rememberCheckbox.checked) {
                    const label = document.querySelector('.mat-checkbox-label')
                    if (label) (label as HTMLElement).click()
                }

                // 点击登录按钮
                const loginButton = document.querySelector('button[mat-flat-button][color="primary"], .action-button') as HTMLButtonElement
                if (loginButton) loginButton.click()

                return '表单已填写并提交'
            },
            { username: credentials.username, password: credentials.password }
        )

        // 截图表单提交后状态
        await page.screenshot({ path: 'form-submitted.png' })
        logger.info('已提交登录表单')

        // 处理智能验证
        logger.info(pc.yellow('如需完成智能验证，请在浏览器中手动操作...'))

        // 等待登录成功
        logger.info('等待登录成功...(最多2分钟)')

        // 等待重定向完成或登录成功
        // 方法1: 等待URL变化
        await Promise.race([
            page.waitForURL('**/cnblogs.com/**', { timeout: 120000 }),
            // 方法2: 等待足够长时间，让用户手动完成
            new Promise(resolve => setTimeout(resolve, 120000))
        ])

        // 确保获取完整Cookie，导航到博客园首页
        logger.info('导航到博客园首页确保获取完整Cookie...')
        await page.goto('https://www.cnblogs.com/', { timeout: 30000 })
        await page.waitForTimeout(3000)

        // 保存认证状态
        const authDir = ensureAuthDir()
        const authFile = path.join(authDir, 'cnblogs.json')
        await page.context().storageState({ path: authFile })

        logger.info(pc.green(`认证成功! 状态已保存到: ${authFile}`))

        return authFile
    } catch (error) {
        const logger = getLogger()
        logger.error(`认证过程出错: ${error.message}`)
        throw error
    }
})

export function copyCookieTest(program: Command) {
    return program
        .createCommand('cookieTest')
        .description('设置博客园登录认证状态')
        .action(async () => {
            const logger = getLogger()
            logger.info(pc.bgCyan('开始博客园认证设置...'))

            try {
                // 确保认证目录存在
                const authDir = ensureAuthDir()
                logger.info(`认证目录: ${authDir}`)

                // 提示用户运行npx命令来执行认证
                logger.info(pc.yellow('请在项目根目录运行以下命令来完成认证:'))
                logger.info(pc.green('npx playwright test -c playwright.config.ts'))

                logger.info('认证完成后，可以运行测试使用已保存的认证状态')
            } catch (error) {
                logger.error(`认证设置失败: ${error.message}`)
            }
        })
}
