/*eslint no-undef: "off"*/
// const postcssScss = require("postcss-scss");

module.exports = {
  // customSyntax: postcssScss,
  extends: [
    "stylelint-config-standard",
    "stylelint-config-html/vue",
    "stylelint-config-standard-scss", // 推荐：增加对 SCSS 标准规则的支持
    "stylelint-config-recess-order",
  ],

  plugins: ["stylelint-order", "stylelint-scss"],

  rules: {
    "order/order": ["custom-properties", "dollar-variables", "declarations", "at-rules", "rules"],
    "scss/load-partial-extension": null, // 允许 @import 带后缀 (解决 scss/load-partial-extension 报错)
    "declaration-property-value-no-unknown": null,
    "selector-class-pattern": null,
    "font-family-no-missing-generic-family-keyword": null,
    "no-descending-specificity": null, // 关闭选择器优先级检查，避免 SCSS 嵌套报错
    "keyframes-name-pattern": null, // 允许驼峰命名的 keyframes
    "declaration-property-value-keyword-no-deprecated": null, // 允许使用 break-word 等废弃属性值
    "scss/no-global-function-names": null, // 允许使用 darken, lighten 等全局函数
    "scss/at-import-partial-extension": null, // 允许 @import 带后缀

    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx"],
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep", "global"],
      },
    ],

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
          "use",
          "forward",
        ],
      },
    ],
    "import-notation": "string",
    "no-empty-source": null,
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: ["constant", "env", "v-bind", "darken", "lighten", "rgba", "var"],
      },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["v-deep"],
      },
    ],
    "selector-type-no-unknown": null,
  },

  ignoreFiles: [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "**/*.json",
    "**/*.md",
    "node_modules/**",
    "dist/**",
    "unpackage/**",
    "style/iconfont/iconfont.css",
    "style/wot-ui-variable.scss",
    "uni.scss",
    "manifest.json",
    "uni_modules/**",
  ],

  overrides: [
    {
      files: ["*.vue", "**/*.vue"],
      customSyntax: "postcss-html",
    },
  ],
};
