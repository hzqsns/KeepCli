//基础处理
//处理命令行参数和输出

// 原生写法
// console.log(process.argv.slice(2));

// commander写法
// esm和commonjs可以混用，但是需要打包工具
const { Command } = require("commander");
const pkg = require("./package.json");

//Keep命令行工具
const program = new Command();
program.name('keep').description('Keep CLI工具').version(pkg.version);

// 定义命令
program
    .command('init')
    .description('初始化项目')
    .argument('<project>', '项目名称')
    .option('-t, --template <template>', '使用什么模板来创建')
    .action((name,options) => {
        //commonjs可以就近导入
        require('./lib/init')(name, options);
    });



// 处理命令行参数
program.parse();

// 输出命令行参数
// console.log(program.args);
