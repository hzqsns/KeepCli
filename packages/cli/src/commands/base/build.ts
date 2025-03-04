import { Command } from 'commander'
import { logger } from '../../utils/logger'

export function build(program: Command) {
    return program
        .createCommand('build')
        .description('build project')
        .action(() => {
            logger.log('build')
        })
}
