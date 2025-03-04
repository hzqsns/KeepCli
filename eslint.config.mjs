import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    ignores: ['node_modules', 'dist', '**/*.js'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        // 'no-console': 'off'
    },
    languageOptions: {
        // 指定解析器
        parser: tseslint.parser,
        // 指定解析器选项
        parserOptions: {
            //project有哪些子包是你的项目
            project: ['./tsconfig.eslint.json', '**/*/tsconfig.json'],
            //tsconfigRootDir是tsconfig.json的根目录
            // tsconfigRootDir: __dirname
        },
        // 指定全局变量
        globals: {
            // 指定node全局变量
            ...globals.node
        }
    }
})
