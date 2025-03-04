//基础处理
//处理命令行参数和输出

// 原生写法
// console.log(process.argv.slice(2));

// commander写法
// esm和commanjs可以混用，但是需要打包工具
const { Command } = require("commander");
const pkg = require("../package.json");

//Keep命令行工具
const program = new Command();
program.name('keep').description('Keep CLI工具').version(pkg.version);

// 定义命令
program
    .command('init')
    .description('初始化项目')
    .arguments('<project>', '项目名称')
    .action((name) => {
        console.log('init', name);
    });



// 处理命令行参数
program.parse();

// 输出命令行参数
// console.log(program.args);
