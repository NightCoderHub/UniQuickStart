import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import VueDevTools from "vite-plugin-vue-devtools";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    uni(),
    VueDevTools(),
    viteCompression({
      verbose: true, // 是否在控制台输出压缩结果
      disable: process.env.UNI_PLATFORM.startsWith("mp-"), // 是否禁用插件，设置为 true 则不压缩
      threshold: 10240, // 文件大小大于这个值时才进行压缩 (单位 byte)，这里是 10KB
      algorithm: "gzip", // 压缩算法，可以是 'gzip' 或 'brotliCompress' (需要 node 11.7.0+)
      ext: ".gz", // 压缩文件的扩展名
      deleteOriginFile: false, // 压缩后是否删除原文件，建议设置为 false，让服务器决定是否使用压缩文件
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/mixins.scss" as *;`,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 判断文件是否来自 node_modules 目录下的 wot-design-uni
          // 这里使用 id.includes() 进行宽松匹配，因为内部路径可能比较复杂
          if (id.includes("node_modules/wot-design-uni")) {
            return "wot-design-uni"; // 将所有相关的 JS/CSS 打包到 'wot-design-uni' 块中
          }
          // 对于其他文件，使用 Rollup 的默认分块策略
          return undefined;
        },
      },
    },
  },
  server: {
    port: 8080, // 开发服务器端口
    host: "0.0.0.0", // 允许局域网访问
    open: false, // 启动时是否自动打开浏览器
    // 配置代理，解决跨域问题（如果你的 uni-app 需要请求后端 API）
    proxy: {
      "/tencent_map_api": {
        target: "https://apis.map.qq.com", // 腾讯地图 Web API 的实际域名
        changeOrigin: true, // 改变源，将请求头中的 Host 字段设置为 target 的 Host，解决跨域问题
        rewrite: (path) => path.replace(/^\/tencent_map_api/, ""), // 重写路径，移除 /tencent_map_api 前缀
        secure: true, // 如果目标是 HTTPS，设置为 true
      },
      "/services": {
        // 当你的前端请求以 '/api' 开头时，例如 fetch('/api/top/anime?sfw')
        target: "https://api.jikan.moe", // 目标 API 的源
        changeOrigin: true, // 开启跨域
        rewrite: (path) => path.replace(/^\/services/, ""), // 重写路径，将 '/api' 替换为空
        secure: true, // 如果目标是 HTTPS，建议设置为 true
      },
    },
  },
});
