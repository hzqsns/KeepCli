//怎么获取到用户的输入

// import { create } from './commands/base/create'
// import { build } from './commands/base/build'
// import { serve } from './commands/base/serve'
// import { info } from './commands/base/info'
import { Command, program } from 'commander'
import './commands'
import './utils/loadTemplate'

// export const run = (args: string[]) => {
//     const [node, path, ...runArgs] = args
//     const [command, ...commandArgs] = runArgs
//     // switch (command) {
//     //     case 'create':
//     //         create(commandArgs)
//     //         break
//     //     case 'build':
//     //         build(commandArgs)
//     //         break
//     //     case 'serve':
//     //         serve(commandArgs)
//     //         break
//     //     default:
//     //         console.log('unknown command')
//     //         break
//     // }
// }

program.version('0.0.1').name('keep').description('Keep CLI')

// /**
//  * 创建项目
//  */
// program.command('create').description('create project').action(create)

// /**
//  * 构建项目
//  */
// program.command('build').description('build project').action(build)

// /**
//  * 运行项目
//  */
// program.command('serve').description('serve project').action(serve)

// /**
//  * 打印信息
//  */
// program.command('info').description('print info').action(info)



export const run = (args: string[]) => {
    program.parse(args)
}
