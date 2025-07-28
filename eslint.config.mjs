import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  // 忽略文件配置，替代 .eslintignore
  {
    ignores: ['node_modules/**', 'dist/**', 'unpackage/**',"uni_modules/**"],
  },
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: 'readonly',
        wx: 'readonly',
        getApp: 'readonly',
        getPage: 'readonly',
        getCurrentPages: 'readonly',
        plus: 'readonly',
        weex: 'readonly',
        __uniConfig: 'readonly',
        __uniRoutes: 'readonly',
      },
    },
    plugins: {
      vue,
    },
    extends: [js.configs.recommended, ...vue.configs['flat/recommended']],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintPluginPrettierRecommended,
])
