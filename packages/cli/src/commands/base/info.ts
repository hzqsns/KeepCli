import { logger } from '../../utils/logger'
import pkg from '../../../package.json'
import { Command } from 'commander'

/**
 * 打印信息
 */
export function info(program: Command) {
    return program
        .createCommand('info')
        .description('info')
        .action(() => {
            logger.info('Using consola 3.0.4')
            logger.log(`Keep CLI version ${pkg.version}`)
        })
}
