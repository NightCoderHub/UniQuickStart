# UniQuickStart

一个高效的 UniApp 模板，可快速启动跨平台应用程序。

## 📱 项目介绍

UniQuickStart 是一个基于 UniApp 框架的跨平台应用开发模板，旨在帮助开发者快速构建高质量的移动应用。该模板集成了现代化的开发工具链和最佳实践，支持多平台部署。

### ✨ 主要特性

- 🚀 **快速启动**: 开箱即用的项目模板
- 📱 **跨平台支持**: 支持 H5、微信小程序、支付宝小程序、百度小程序、抖音小程序、Android、iOS
- 🎨 **现代化 UI**: 集成 wot-design-uni 组件库
- 📄 **分页组件**: 内置 z-paging 分页组件
- 🔐 **用户认证**: 完整的登录注册流程
- 🛡️ **隐私保护**: 内置隐私协议处理机制
- 📦 **状态管理**: 基于 Pinia 的状态管理
- 🌐 **网络请求**: 封装的 HTTP 请求工具
- 🎯 **代码规范**: ESLint + Prettier + Stylelint 代码规范
- 🔧 **开发工具**: 集成 Git Hooks 和代码格式化

## 🛠️ 技术栈

- **框架**: UniApp + Vue 3
- **状态管理**: Pinia
- **UI 组件**: wot-design-uni
- **分页组件**: z-paging
- **开发语言**: JavaScript/TypeScript
- **代码规范**: ESLint + Prettier + Stylelint
- **包管理器**: pnpm
- **构建工具**: Vite
- **版本控制**: Git + Husky

## 📋 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- HBuilderX (推荐) 或 VS Code

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd UniQuickStart
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 运行项目

#### H5 开发

```bash
pnpm dev:h5
```

#### 微信小程序开发

```bash
pnpm dev:mp-weixin
```

#### 其他平台

请在 HBuilderX 中打开项目，选择对应平台进行运行。

## 📁 项目结构

```
UniQuickStart/
├── api/                    # API 接口定义
│   ├── auth.js            # 认证相关接口
│   └── index.js           # 通用接口
├── components/            # 公共组件
│   ├── anime-card/        # 动漫卡片组件
│   ├── custom-tabbar/     # 自定义底部导航
│   └── action-confirmation-modal/ # 确认弹窗组件
├── constants/             # 常量定义
│   └── index.js          # 应用常量
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── login/            # 登录页
│   ├── me/               # 个人中心
│   ├── register/         # 注册页
│   ├── forgot-password/  # 忘记密码
│   ├── privacy/          # 隐私政策
│   ├── address/          # 地址管理
│   ├── agreement/        # 服务协议
│   └── feedback/         # 意见反馈
├── settingPages/          # 设置相关分包页面
│   ├── setting/          # 系统设置
│   ├── account/          # 账户设置
│   ├── legal/            # 法律条款
│   ├── help-feedback/    # 帮助反馈
│   ├── about/            # 关于我们
│   └── system-permissions/ # 系统权限
├── static/               # 静态资源
│   ├── tabbar/           # 底部导航图标
│   └── images/           # 图片资源
├── stores/               # 状态管理
│   ├── modules/          # 状态模块
│   │   └── user.js       # 用户状态
│   └── index.js          # 状态入口
├── styles/               # 样式文件
│   ├── iconfont.css      # 图标字体
│   └── wot-ui-variable.scss # UI 变量
│   └── mixins.scss       # 常用 SCSS mixins
│   └── utilities.scss    # 原子化工具类
│   └── components.scss   # 通用组件样式
│   └── layout.scss       # 布局相关样式
│   └── animations.scss   # 动画效果
├── utils/                # 工具函数
│   ├── request.js        # 网络请求封装
│   └── util.js           # 通用工具
├── App.vue               # 应用入口
├── main.js               # 主入口文件
├── manifest.json         # 应用配置
├── pages.json            # 页面配置
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 🔧 开发指南

### 代码规范

项目集成了完整的代码规范工具链：

```bash
# 代码检查
pnpm lint:check

# 代码修复
pnpm lint

# 格式化检查
pnpm format:check

# 格式化代码
pnpm format

# 样式检查
pnpm lint:style
```

### 状态管理

使用 Pinia 进行状态管理，示例：

```javascript
// stores/modules/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: uni.getStorageSync("userInfo") || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.userInfo,
  },
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      uni.setStorageSync("userInfo", userInfo);
    },
  },
});
```

### 网络请求

使用封装的 request 工具：

```javascript
import request from "@/utils/request";

// GET 请求
const data = await request.get("/api/data");

// POST 请求
const result = await request.post("/api/login", {
  username: "user",
  password: "pass",
});
```

### 组件开发

使用 wot-design-uni 组件库：

```vue
<template>
  <wd-button type="primary" @click="handleClick"> 点击按钮 </wd-button>
</template>
```

## 📦 构建部署

### H5 部署

```bash
# 构建 H5
pnpm build:h5

# 构建产物在 dist/build/h5 目录
```

### 小程序部署

1. 在 HBuilderX 中选择对应平台
2. 点击发行 -> 小程序
3. 按照平台要求配置 AppID
4. 上传代码到对应平台

### App 部署

1. 在 HBuilderX 中选择 App 平台
2. 配置证书和签名
3. 点击发行 -> 原生 App-云打包
4. 下载安装包进行分发

## 🔑 配置说明

### 环境配置

在 `constants/index.js` 中配置应用常量：

```javascript
export const APP_CONFIG = {
  APP_NAME: "UniQuickStart",
  VERSION: "1.0.0",
  API_BASE_URL: "https://api.example.com",
  DEFAULT_PAGE_SIZE: 20,
};
```

### 平台配置

在 `manifest.json` 中配置各平台参数：

- 微信小程序：配置 `mp-weixin.appid`
- 支付宝小程序：配置 `mp-alipay.appid`
- 地图服务：配置腾讯地图 API Key

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 提交规范

请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [UniApp](https://uniapp.dcloud.io/) - 跨平台应用开发框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [wot-design-uni](https://wot-design-uni.netlify.app/) - UniApp 组件库
- [z-paging](https://z-paging.zxlee.cn/) - 分页组件
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至：[your-email@example.com]
- 加入讨论群：[群号]

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
