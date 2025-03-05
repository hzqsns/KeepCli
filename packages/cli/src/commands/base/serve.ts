import { spawn } from 'node:child_process'
import { logger } from '../../utils/logger'
import { Command } from 'commander'

export function serve(program: Command) {
    return program
        .createCommand('serve')
        .description('serve')
        .action(() => {
            logger.log('serve')
            //执行项目启动命令
            //npm run dev or pnpm dev

            // node中怎么执行命令
            const command = 'npm'
            const params = ['run', 'dev']

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
