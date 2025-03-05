import { Command } from 'commander'
import { logger } from '../../utils/logger'
import { spawn } from 'node:child_process'

export function build(program: Command) {
    return program
        .createCommand('build')
        .description('build project')
        .action(() => {
            logger.log('build')
            //执行项目打包命令
            //npm run build or pnpm build
            const command = 'npm'
            const params = ['run', 'build']

            const child = spawn(command, params, {
                stdio: 'inherit'
            })

            child.on('close', (code) => {
                logger.log(`子进程退出码: ${code}`)
            })

            child.on('error', (error) => {
                logger.error(`子进程错误: ${error}`)
            })
            child.stdout.on('data', (data) => {
                logger.log(data.toString())
            })
        })
}
