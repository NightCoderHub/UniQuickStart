/*eslint no-undef: "off"*/
// const postcssScss = require("postcss-scss");

module.exports = {
  // customSyntax: postcssScss,
  extends: [
    "stylelint-config-standard",
    "stylelint-config-html/vue",
    "stylelint-config-recess-order",
    "stylelint-config-prettier",
  ],

  plugins: ["stylelint-order", "stylelint-scss"],

  rules: {
    "declaration-property-value-no-unknown": null,
    "selector-class-pattern": null,
    "selector-type-no-unknown": [
      true,
      {
        ignoreTypes: ["page", "scroll-view", "uni-tabbar"],
      },
    ],
    "font-family-no-missing-generic-family-keyword": null,

    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx"],
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep"],
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
    "style/wot-ui-variable.scss",
    "uni.scss",
  ],
};
