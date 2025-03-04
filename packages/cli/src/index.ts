// export * from "./lib/base";

import { run } from './cli'

export const runKeepCLI = () => {
    run(process.argv)
}

// 入口文件一定不要弄脏，保持足够的简洁
// 入口文件的职责就是给外部去暴露内部的api的