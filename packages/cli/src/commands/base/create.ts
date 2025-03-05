import { logger } from '../../utils/logger'
import { Command } from 'commander'
import { loadTemplate } from '../../utils/loadTemplate'
import pc from 'picocolors'
import prompts from 'prompts'

export function create(program: Command) {
    return program
        .createCommand('create')
        .description('create project')
        .arguments('<name>')
        .option('-t, --template <template>', 'template name')
        .action(async (projectName, options) => {
            let { template } = options
            console.log('template----->', projectName, template)
            if (!template) {
                //如果没有输入具体模版，则进行询问
                const templateRes = await prompts({
                    type: 'select',
                    name: 'template',
                    message: '请选择模版',
                    choices: [
                        { title: 'React', value: 'react' },
                        { title: 'Vue', value: 'vue' },
                        { title: 'React TypeScript', value: 'react-ts' },
                        { title: 'Vue TypeScript', value: 'vue-ts' },
                        { title: 'Vanilla', value: 'vanilla' },
                        { title: 'Vanilla TypeScript', value: 'vanilla-ts' }
                    ]
                })

                template = templateRes.template
            }

            logger.info(`create project, name: ${projectName}, template: ${template}`)
            logger.info(pc.bgCyan('create project'))
            loadTemplate({ projectName, templateName: template, local: true })
        })
}
