/**
 * 加载本地模板，fs操作
 */
import { readFile, copy } from 'fs-extra'
import { join } from 'node:path'
import { downloadTemplate } from 'giget'

// readFile(join(__dirname, '../package.json'), 'utf-8').then(data => {
//     console.log(data)
// })

interface LoadTemplateParams {
    projectName: string
    templateName: string
    local?: boolean
}

// 读取本地模版
export const loadLocalTemplate = async (params: Omit<LoadTemplateParams, 'local'>) => {
    /**
     * 将模版文件拷贝到当前目录下
     */
    const { projectName, templateName } = params
    copy(join(__dirname, `../templates/template-${templateName}`), `${process.cwd()}/${projectName}`)
}

// 读取远程模板
export const loadRemoteTemplate = async (params: Omit<LoadTemplateParams, 'local' | 'templateName'>) => {
    /**
     * 将模版文件拷贝到当前目录下
     */
    const { projectName } = params
    const { dir } = await downloadTemplate(`https://codeload.github.com/design-sparx/antd-multipurpose-dashboard/tar.gz/refs/heads/main`, {
        dir: `${process.cwd()}/.temp`
    })

    await copy(dir, `${process.cwd()}/${projectName}`)
}
// 根据参数读取模版
export const loadTemplate = async (params: LoadTemplateParams) => {
    const { local, ...restParams } = params
    if (local) {
        return loadLocalTemplate(restParams)
    }
    return loadRemoteTemplate(restParams)
}
