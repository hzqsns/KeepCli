import prompts from 'prompts'
import { Command } from 'commander'
import { logger } from '../../utils/logger'

export function greet(program: Command) {
    return program
        .createCommand('greet')
        .description('greet')
        .action(async () => {
            const nameResult = await prompts({
                type: 'text',
                name: 'name',
                message: 'What is your name?'
            })
            const hobbyResult = await prompts({
                type: 'select',
                name: 'hobby',
                message: 'What is your hobby?',
                choices: [
                    { title: 'reading', value: 'reading' },
                    { title: 'running', value: 'running' },
                    { title: 'swimming', value: 'swimming' }
                ]
            })
            logger.log(`Hello ${nameResult.name}`, `Your hobby is ${hobbyResult.hobby}`)
        })
}
