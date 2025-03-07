import { chromium } from 'playwright'
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
            message: '请输入淘宝账号:',
            validate: value => (value.length > 0 ? true : '账号不能为空')
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入淘宝密码:',
            validate: value => (value.length > 0 ? true : '密码不能为空')
        }
    ])

    if (!credentials.username || !credentials.password) {
        throw new Error('账号或密码未提供，操作已取消')
    }

    return credentials
}

// 定义登录成功的标志选择器，在整个函数中使用
const successSelectors = [
    '.site-nav-login-info-nick',
    '.site-nav-user',
    '.J_SiteNavLoginInfo',
    '.J_Menu_MyTaobao',
    '.site-nav-menu-hd',
    '.site-nav-sign',
    'a:has-text("我的淘宝")'
]

export function copyCookie(program: Command) {
    return program
        .createCommand('cookie')
        .description('获取淘宝登录Cookie')
        .action(async () => {
            const logger = getLogger()
            logger.info(pc.bgCyan('开始获取淘宝Cookie...'))

            try {
                // 获取用户凭据
                const credentials = await getCredentials()

                // 启动浏览器，设置视口大小以确保元素可见
                const browser = await chromium.launch({
                    headless: false, // 设置为 false 以便用户可以看到登录过程
                    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'] // 添加参数以减少一些安全限制
                })

                const context = await browser.newContext({
                    viewport: { width: 1280, height: 800 },
                    userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' // 设置一个常见的用户代理
                })

                const page = await context.newPage()

                // 直接访问淘宝登录页面（密码登录）
                logger.info('正在访问淘宝登录页面...')
                await page.goto('https://login.taobao.com')
                await page.waitForLoadState('networkidle')

                // 等待登录表单出现
                logger.info('等待登录表单加载...')
                try {
                    // 等待用户名输入框出现，基于淘宝登录页面结构
                    await page.waitForSelector('#fm-login-id, input[name="fm-login-id"], input[name="logonId"], #TPL_username_1', {
                        timeout: 10000
                    })
                    logger.info('登录表单已加载')
                } catch (error) {
                    logger.error('登录表单加载超时')
                    await page.screenshot({ path: 'login-form-error.png' })
                    logger.info('已保存页面截图到 login-form-error.png')
                    throw new Error('登录表单加载失败')
                }

                // 查找用户名和密码输入框
                logger.info('正在填写登录信息...')
                try {
                    // 尝试多种可能的选择器，基于淘宝登录页面结构
                    const usernameSelectors = ['#fm-login-id', 'input[name="fm-login-id"]', 'input[name="logonId"]', '#TPL_username_1']

                    const passwordSelectors = [
                        '#fm-login-password',
                        'input[name="fm-login-password"]',
                        'input[name="password"]',
                        'input[type="password"]',
                        '#TPL_password_1'
                    ]

                    const submitSelectors = [
                        'button[type="submit"]',
                        '.fm-button',
                        '.J_Submit',
                        '#login-form button',
                        'button:has-text("登录")',
                        '#J_SubmitStatic'
                    ]

                    const agreementSelectors = [
                        '#J_AgreeCheckbox',
                        'input[type="checkbox"][name="agreement"]',
                        'input[type="checkbox"][id*="agreement"]',
                        'input[type="checkbox"].J_Checkbox'
                    ]

                    // 填写用户名
                    let usernameSelector = null
                    for (const selector of usernameSelectors) {
                        if (await page.$(selector)) {
                            usernameSelector = selector
                            break
                        }
                    }

                    if (usernameSelector) {
                        // 使用更稳定的方法填写用户名
                        await page.waitForSelector(usernameSelector, { state: 'visible', timeout: 5000 })
                        // 先清空输入框
                        await page.evaluate(selector => {
                            const input = document.querySelector(selector)
                            if (input) (input as HTMLInputElement).value = ''
                        }, usernameSelector)
                        // 使用type方法逐字输入
                        await page.type(usernameSelector, credentials.username, { delay: 100 })
                        logger.info(`已填写用户名: ${usernameSelector}`)
                    } else {
                        throw new Error('未找到用户名输入框')
                    }

                    // 填写密码
                    let passwordSelector = null
                    for (const selector of passwordSelectors) {
                        if (await page.$(selector)) {
                            passwordSelector = selector
                            break
                        }
                    }

                    if (passwordSelector) {
                        // 使用更稳定的方法填写密码
                        await page.waitForSelector(passwordSelector, { state: 'visible', timeout: 5000 })
                        // 先清空输入框
                        await page.evaluate(selector => {
                            const input = document.querySelector(selector)
                            if (input) (input as HTMLInputElement).value = ''
                        }, passwordSelector)
                        // 使用type方法逐字输入
                        await page.type(passwordSelector, credentials.password, { delay: 100 })
                        logger.info(`已填写密码: ${passwordSelector}`)
                    } else {
                        throw new Error('未找到密码输入框')
                    }

                    // 检查并勾选协议复选框（如果存在且未勾选）
                    logger.info('检查并勾选用户协议...')
                    let agreementChecked = false

                    // 等待协议复选框出现
                    await page.waitForTimeout(1000) // 给页面一些时间加载复选框

                    for (const selector of agreementSelectors) {
                        try {
                            // 等待复选框可见
                            await page.waitForSelector(selector, { state: 'visible', timeout: 2000 }).catch(() => {
                                logger.info(`复选框选择器 ${selector} 未找到或不可见`)
                            })

                            // 先检查元素是否存在
                            const exists = await page.$(selector)
                            if (exists) {
                                logger.info(`找到协议复选框: ${selector}`)

                                // 检查是否已经勾选
                                const isChecked = await page.evaluate(selector => {
                                    const checkbox = document.querySelector(selector) as HTMLInputElement
                                    return checkbox && checkbox.checked
                                }, selector)

                                if (!isChecked) {
                                    logger.info('复选框未勾选，尝试勾选...')

                                    // 尝试直接点击复选框
                                    try {
                                        await page.click(selector, { force: true, timeout: 3000 })
                                        logger.info('已点击复选框')
                                    } catch (clickError) {
                                        logger.warn(`直接点击复选框失败: ${clickError.message}`)

                                        // 使用JavaScript直接设置checked属性
                                        await page.evaluate(selector => {
                                            const checkbox = document.querySelector(selector) as HTMLInputElement
                                            if (checkbox) {
                                                checkbox.checked = true

                                                // 触发多个事件，确保UI和状态同步
                                                const events = ['change', 'click', 'input']
                                                events.forEach(eventType => {
                                                    const event = new Event(eventType, { bubbles: true })
                                                    checkbox.dispatchEvent(event)
                                                })

                                                return true
                                            }
                                            return false
                                        }, selector)
                                        logger.info('已通过JavaScript设置复选框状态')
                                    }

                                    // 验证是否成功勾选
                                    const nowChecked = await page.evaluate(selector => {
                                        const checkbox = document.querySelector(selector) as HTMLInputElement
                                        return checkbox && checkbox.checked
                                    }, selector)

                                    if (nowChecked) {
                                        logger.info(`已成功勾选用户协议: ${selector}`)
                                        agreementChecked = true
                                    } else {
                                        logger.warn(`勾选用户协议失败: ${selector}`)
                                    }
                                } else {
                                    logger.info(`用户协议已经被勾选: ${selector}`)
                                    agreementChecked = true
                                }

                                // 如果找到并处理了复选框，就跳出循环
                                if (agreementChecked) break
                            }
                        } catch (error) {
                            logger.warn(`处理协议复选框时出错 (${selector}): ${error.message}`)
                        }
                    }

                    // 如果常规方法都失败了，尝试使用更直接的方法
                    if (!agreementChecked) {
                        logger.warn('常规方法勾选协议失败，尝试使用更直接的方法...')

                        try {
                            // 尝试使用XPath定位复选框
                            await page
                                .evaluate(() => {
                                    // 查找所有复选框
                                    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
                                    // 遍历并勾选所有复选框
                                    checkboxes.forEach(checkbox => {
                                        ;(checkbox as HTMLInputElement).checked = true
                                        // 触发change事件
                                        const event = new Event('change', { bubbles: true })
                                        checkbox.dispatchEvent(event)
                                    })
                                    return checkboxes.length > 0
                                })
                                .then(result => {
                                    if (result) {
                                        logger.info('已通过直接DOM操作勾选复选框')
                                        agreementChecked = true
                                    }
                                })
                        } catch (error) {
                            logger.error(`直接DOM操作勾选复选框失败: ${error.message}`)
                        }
                    }

                    // 如果仍然没有勾选成功，记录警告（淘宝可能不需要勾选协议）
                    if (!agreementChecked) {
                        logger.warn('未能勾选用户协议复选框，但淘宝可能不强制要求勾选')
                    }

                    // 等待一小段时间，确保复选框状态更新
                    await page.waitForTimeout(1000)

                    // 点击登录按钮
                    let submitSelector = null
                    for (const selector of submitSelectors) {
                        if (await page.$(selector)) {
                            submitSelector = selector
                            break
                        }
                    }

                    if (submitSelector) {
                        // 等待按钮可点击
                        await page.waitForSelector(submitSelector, { state: 'visible', timeout: 5000 })

                        logger.info('准备点击登录按钮，等待页面跳转...')

                        // 设置导航监听，更准确地捕获页面跳转
                        const navigationPromise = page
                            .waitForNavigation({
                                timeout: 120000, // 给用户2分钟的时间完成验证
                                waitUntil: 'networkidle'
                            })
                            .catch(err => {
                                logger.info('未检测到页面跳转，继续检查登录状态')
                                return null
                            })

                        // 点击登录按钮
                        try {
                            await page.click(submitSelector)
                            logger.info(`已点击登录按钮: ${submitSelector}`)
                        } catch (clickError) {
                            logger.warn(`常规点击登录按钮失败，尝试使用JavaScript点击`)

                            // 使用JavaScript直接点击按钮
                            await page
                                .evaluate(selector => {
                                    const button = document.querySelector(selector) as HTMLButtonElement
                                    if (button && !button.disabled) {
                                        button.click()
                                        return true
                                    }
                                    return false
                                }, submitSelector)
                                .then(clicked => {
                                    if (clicked) {
                                        logger.info(`已通过JavaScript点击登录按钮`)
                                    } else {
                                        logger.warn('登录按钮被禁用或无法点击')
                                    }
                                })
                        }

                        // 检查是否出现滑块验证码
                        logger.info('检查是否需要滑块验证...')
                        logger.info(pc.yellow('如果出现滑块验证，请在浏览器中手动完成滑动操作'))

                        // 截图帮助用户识别
                        await page.screenshot({ path: 'login-state.png' })
                        logger.info('已保存当前页面状态截图到 login-state.png')

                        // 等待导航完成或用户手动操作完成
                        logger.info('等待页面跳转或用户完成验证...')

                        // 等待导航完成
                        const navigationResult = await navigationPromise

                        // 如果发生导航，检查是否为成功登录
                        if (navigationResult) {
                            const currentUrl = page.url()
                            logger.info(`页面已跳转到: ${currentUrl}`)

                            if (currentUrl.includes('taobao.com') && !currentUrl.includes('login.taobao.com')) {
                                logger.info('登录成功：已跳转到淘宝页面')
                                return await collectCookiesAfterLogin(page, context, logger)
                            }
                        }

                        // 如果没有跳转或跳转后不是淘宝页面，继续检查登录状态
                        logger.info('检查登录状态...')

                        // 再等待最多60秒，检查登录状态
                        for (let i = 0; i < 60; i++) {
                            // 检查URL是否为淘宝页面（非登录页面）
                            const currentUrl = page.url()
                            if (currentUrl.includes('taobao.com') && !currentUrl.includes('login.taobao.com')) {
                                logger.info('登录成功：当前URL为淘宝页面')
                                return await collectCookiesAfterLogin(page, context, logger)
                            }

                            // 检查登录成功标志
                            for (const selector of successSelectors) {
                                const element = await page.$(selector)
                                if (element) {
                                    const text = await element.textContent()
                                    logger.info(`登录成功，找到标志: ${selector}${text ? ` (${text.trim()})` : ''}`)
                                    return await collectCookiesAfterLogin(page, context, logger)
                                }
                            }

                            await page.waitForTimeout(1000)
                            if (i % 10 === 0) {
                                logger.info(`等待登录完成...已等待${i}秒`)
                                if (i > 0 && i % 30 === 0) {
                                    await page.screenshot({ path: `waiting-${i}s.png` })
                                    logger.info(`已保存当前状态截图到 waiting-${i}s.png`)
                                }
                            }
                        }

                        // 超时，登录失败
                        logger.error('登录超时：未能检测到登录成功')
                        await page.screenshot({ path: 'login-timeout.png' })
                        logger.info('已保存页面截图到 login-timeout.png')
                        throw new Error('登录超时，无法获取有效的Cookie')
                    } else {
                        throw new Error('未找到登录按钮')
                    }
                } catch (error) {
                    logger.error(`填写登录信息失败: ${error.message}`)
                    await page.screenshot({ path: 'login-fill-error.png' })
                    logger.info('已保存页面截图到 login-fill-error.png')
                }
            } catch (error) {
                logger.error(`获取Cookie失败: ${error.message}`)
                throw error
            }
        })
}

// 提取收集Cookie的逻辑为单独的函数
async function collectCookiesAfterLogin(page, context, logger) {
    // 确保在淘宝页面获取Cookie，这样可以获取到完整的认证信息
    if (!page.url().includes('taobao.com') || page.url().includes('login.taobao.com')) {
        logger.info('跳转到淘宝首页以获取完整的Cookie...')
        await page.goto('https://www.taobao.com', { waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)
    }

    // 确认登录成功后，获取所有 Cookie
    logger.info('登录成功，正在获取 Cookie...')

    // 访问几个重要页面确保所有Cookie都被设置
    logger.info('访问用户中心页面以确保获取完整Cookie...')
    await page.goto('https://i.taobao.com/my_taobao.htm', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 获取所有Cookie
    const cookies = await context.cookies()

    if (cookies.length === 0) {
        throw new Error('未获取到任何 Cookie，可能登录失败')
    }

    // 检查是否包含关键的认证Cookie
    const authCookies = cookies.filter(
        cookie =>
            cookie.name.includes('_l_g_') ||
            cookie.name.includes('_nk_') ||
            cookie.name.includes('cookie17') ||
            cookie.name.includes('cookie2') ||
            cookie.name.includes('unb') ||
            cookie.name.includes('_tb_token_') ||
            cookie.name.includes('lgc')
    )

    if (authCookies.length === 0) {
        logger.warn('未找到关键的认证Cookie')
        logger.warn('获取的Cookie可能不包含登录凭证')
    } else {
        logger.info(`成功获取 ${authCookies.length} 个认证Cookie`)
        // 打印关键Cookie的名称，帮助调试
        logger.info(`认证Cookie名称: ${authCookies.map(c => c.name).join(', ')}`)
    }

    // 获取项目根目录下的 src/.env 文件路径
    const envPath = path.resolve(process.cwd(), 'src/.env')
    logger.info(`尝试更新 Cookie 到 ${envPath}`)

    // 检查文件是否存在
    let envContent = ''
    try {
        envContent = fs.readFileSync(envPath, 'utf8')
    } catch (error) {
        // 如果文件不存在，创建一个空文件
        envContent = ''
        logger.info(`创建新的 .env 文件: ${envPath}`)
    }

    // 更新或添加 VITE_COOKIE
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    const envLines = envContent.split('\n')
    const cookieLine = `VITE_COOKIE="${cookieString}"`
    const cookieIndex = envLines.findIndex(line => line.startsWith('VITE_COOKIE='))

    if (cookieIndex >= 0) {
        // 更新现有的 VITE_COOKIE
        envLines[cookieIndex] = cookieLine
    } else {
        // 添加新的 VITE_COOKIE
        envLines.push(cookieLine)
    }

    // 确保目录存在
    const dir = path.dirname(envPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // 写入更新后的内容
    fs.writeFileSync(envPath, envLines.join('\n'))
    logger.info(`已更新 Cookie 到 ${envPath}`)

    // 关闭浏览器
    await context.close()
    logger.info(pc.green('✓ Cookie 获取完成'))

    return cookieString
}
