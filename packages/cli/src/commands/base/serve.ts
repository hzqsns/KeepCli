import { logger } from '../../utils/logger'
import { Command } from 'commander'

export function serve(program: Command) {
    return program
        .createCommand('serve')
        .description('serve')
        .action(() => {
            logger.log('serve')
        })
}
