import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config"; // 正确地引入 defineConfig
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  // 1. 忽略的文件和目录 (建议放在最前面，以确保它们尽快被忽略)
  {
    ignores: [
      "dist/**", // 忽略 dist 目录及其内容
      "node_modules/**", // 忽略 node_modules 目录及其内容
      "static/**", // 忽略 static 目录及其内容 (UniApp 常见)
      "components.d.ts", // 忽略 components.d.ts 文件 (由 Volar/Vue Language Features 生成)
      // "!**/.prettierrc.js", // 这一行通常不需要，因为 .prettierrc.js 通常不会被 lint，且 ESLint 默认不会忽略以 . 开头的文件。
      // 如果你的项目有 .env 或其他敏感文件，也应该在这里忽略
      ".env",
      ".env.*",
      "unpackage/**", // UniApp 构建目录
      "uni_modules/**", // UniApp 插件目录（如果不需要被 lint）
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "pnpm-debug.log*",
    ],
  },

  // 2. JavaScript 基本配置 (适用于所有 .js, .mjs, .cjs, .vue 文件)
  // 建议将文件类型定义在这里，并包含所有相关的语言/插件配置
  {
    files: ["**/*.{js,mjs,cjs,vue}"], // 明确指定这些规则适用于哪些文件
    plugins: {
      js: js, // 这里的 key 'js' 对应你在 extends 中引用的 "js/recommended"
    },
    extends: [
      "js/recommended", // ESLint 推荐的 JavaScript 规则
    ],
    languageOptions: {
      ecmaVersion: "latest", // 建议明确指定 ECMAScript 版本
      sourceType: "module", // 建议明确指定模块类型
      globals: {
        ...globals.browser, // 浏览器环境全局变量
        // ...globals.node, // 如果你也有 Node.js 环境的代码，可以加上
        uni: true, // UniApp 全局对象
        // 如果你的 UniApp 项目还涉及到其他小程序平台特有的全局变量，例如：
        wx: true,
        // tt: true,
        // my: true,
        // swan: true,
        // jd: true,
        // qq: true
        process: true,
      },
    },
    rules: {
      // 在这里添加适用于 JS/Vue 的通用规则
    },
  },

  // 3. Vue 特定配置
  // `pluginVue.configs["flat/recommended"]` 包含了对 Vue 文件的基本配置和一些推荐规则
  pluginVue.configs["flat/recommended"],

  // 4. Vue 额外的规则覆盖或自定义
  {
    files: ["**/*.vue"], // 确保这些规则只应用于 Vue 文件
    rules: {
      "vue/block-order": [
        "error",
        {
          order: [
            "template",
            "script:not([setup])", // 传统的 <script> 标签
            "script[setup]", // <script setup> 标签
            "style:not([scoped])", // 非 scoped 的 <style> 标签
            "style[scoped]", // scoped 的 <style> 标签
          ],
        },
      ],
      "vue/multi-word-component-names": "off", // 或者 0
      "vue/require-default-prop": "off", // 或者 0
      "vue/valid-v-for": "off", // 或者 0 (注意：禁用这个规则可能会错过潜在的错误)
      // 建议：如果你在使用 Vue 3，可以考虑启用一些新的 Vue 3 相关的规则，例如：
      // "vue/component-api-style": ["error", ["script-setup", "composition"]], // 强制使用 Composition API 风格
      // "vue/no-v-html": "off", // 如果你需要禁用 v-html 警告
    },
  },

  // 5. Prettier 集成 (通常放在 extends 的最后，以禁用所有冲突规则)
  // eslintPluginPrettierRecommended 已经包含了 eslint-config-prettier 的功能
  // 所以它会禁用所有 ESLint 中与 Prettier 冲突的规则，并将 Prettier 的格式问题作为 ESLint 错误报告。
  eslintPluginPrettierRecommended,

  // 6. 如果你需要 TypeScript 支持，需要额外添加配置。
  // import tseslint from "typescript-eslint";
  // {
  //   files: ["**/*.ts", "**/*.tsx"], // 确保这些规则只应用于 TS 文件
  //   extends: [
  //     ...tseslint.configs.recommended, // TypeScript ESLint 推荐规则
  //     // 你可能还需要其他 TypeScript 相关的规则
  //   ],
  //   languageOptions: {
  //     parser: tseslint.parser,
  //     parserOptions: {
  //       project: './tsconfig.json', // 关键：指定你的 tsconfig.json 路径
  //       ecmaVersion: 'latest',
  //       sourceType: 'module',
  //     },
  //   },
  // },
]);
