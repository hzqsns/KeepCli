import { program, Command } from 'commander'

type Fn = (p: Command) => Command

//负责插件的注册
export function registerCommand(fn: Fn) {
    program.addCommand(fn(program))
}

/**
 * 先定义一个command：program.createCommand
 * 然后再注册 command的时候，调用command.addCommand
 */


