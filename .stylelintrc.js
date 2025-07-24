/*eslint no-undef: "off"*/
// const postcssScss = require("postcss-scss");

module.exports = {
  // customSyntax: postcssScss,
  // Stylelint 15+ 版本不再需要 'processors' 来解析 Vue SFC，
  // 而是通过 'extends' 中的 `stylelint-config-html/vue` 来处理。
  // 如果你没有特殊的后处理需求，可以移除或留空 'processors'。
  // processors: [],

  // 继承一系列的配置，从通用到具体，最后是 Prettier
  extends: [
    "stylelint-config-standard", // Stylelint 官方标准配置
    "stylelint-config-html/vue", // **关键！** 针对 Vue 单文件组件的样式解析
    "stylelint-config-recess-order", // 属性排序规则
    "stylelint-config-prettier", // 确保与 Prettier 兼容，禁用冲突规则
  ],
  // 插件，扩展 Stylelint 的功能
  plugins: [
    "stylelint-order", // 属性排序
    "stylelint-scss", // SCSS 特有规则
  ],
  // 自定义规则，会覆盖继承的规则
  rules: {
    "declaration-property-value-no-unknown": null, // 禁用此规则
    "selector-class-pattern": null,
    "selector-type-no-unknown": [
      true,
      {
        ignoreTypes: ["page", "scroll-view", "uni-tabbar"],
      },
    ],
    "font-family-no-missing-generic-family-keyword": null,
    // 'at-rule-descriptor-no-unknown': null,
    "unit-no-unknown": [
      true, // 启用此规则
      {
        ignoreUnits: ["rpx"], // 忽略 rpx 单位，避免报错
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep"],
      },
    ],
    // 针对 SCSS 的 `@` 规则，忽略一些 SCSS 特有的关键字，防止 Stylelint 报错
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "include",
          "mixin",
          "extend",
          "for",
          "each",
          "if",
          "else",
          "else-if",
          "function",
          "return",
        ],
      },
    ],
    "import-notation": "string",
    "no-empty-source": null,
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: ["constant", "env"],
      },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["v-deep"],
      },
    ],
  },
  // 忽略文件
  ignoreFiles: [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "**/*.json",
    "**/*.md",
    "node_modules/**",
    "dist/**",
    "style/iconfont/iconfont.css",
  ],
};
