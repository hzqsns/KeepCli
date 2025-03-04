const pc = require('picocolors');
const prompts = require('prompts');
//初始化项目

//先询问用户，是否按照一定意愿初始化

// 项目名称

// 文件夹位置

// 使用什么模板来创建

//导出

const init = async (name, options) => {
    console.log(pc.green('初始化项目'), name, options);

    // 询问用户是否初始化
    // prompts({
    //     type: 'confirm',
    //     name: 'isInit',
    //     message: '是否初始化项目',
    // }).then(res => {
    //     console.log(res);
    // });

    const res = await prompts([
        {
            type: 'text',
            name: 'projectName',
            message: '请输入项目名称',
            initial: __dirname.split('/').pop(),
        },
        {
            type: 'text',
            name: 'folder',
            message: '请输入项目文件夹位置',
            initial: './',
        },
        {
            type: 'select',
            name: 'template',
            message: '请选择项目模板',
            choices: [
                { title: 'Vue2', value: 'vue2' },
                { title: 'Vue3', value: 'vue3' },
                { title: 'React', value: 'react' },
            ],
        }
    ]);


    console.log(res);
}

module.exports = exports = init;