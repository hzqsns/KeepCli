import { logger } from "../../utils/logger";
import { Command } from "commander";
export function create(program: Command) {
    return program
        .createCommand('create')
        .description('create project')
        .action(() => {
            logger.log('create')
        })
}
 