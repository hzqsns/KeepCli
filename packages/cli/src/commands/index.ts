import { logger } from '../utils/logger'
import { build } from './base/build'
import { serve } from './base/serve'
import { create } from './base/create'
import { greet } from './base/greet'
import { info } from './base/info'
import { copyCookie } from './base/copyCookie'
import { copyCookieTest } from './base/copyCookieTest'
import { useCookieTest } from './base/useCookieTest'
import { registerCommand } from './registerCommand'

/**
 * 定义命令的格式
 */
// export interface Command {
//   name: string; // 命令名称
//   description: string; // 命令描述
//   action: (...args: any[]) => void; // 命令执行函数
// }

/**
 * 基于插件化的实现
 * 举例
 * Vue.use(VueRouter)
 * Vue.use(Vuex)
 * Vue.use(VueI18n)
 */

// 注册命令
registerCommand(build)
registerCommand(serve)
registerCommand(create)
registerCommand(greet)
registerCommand(info)
registerCommand(copyCookie)
registerCommand(copyCookieTest)
registerCommand(useCookieTest)
