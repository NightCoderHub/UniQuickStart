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
  server: {
    port: 8080, // 开发服务器端口
    host: "0.0.0.0", // 允许局域网访问
    open: false, // 启动时是否自动打开浏览器
    // 配置代理，解决跨域问题（如果你的 uni-app 需要请求后端 API）
    proxy: {},
  },
});
