<template>
  <view
    v-if="showPopup"
    class="update-popup-overlay"
    @touchmove.stop.prevent="() => {}"
  >
    <view class="update-popup-content">
      <image
        class="upgrade-icon"
        src="/static/upgrade.png"
        mode="widthFix"
      ></image>

      <view class="update-popup-main">
        <text class="update-popup-title">发现新版本 v{{ version }}</text>
        <scroll-view scroll-y class="update-popup-scroll-view">
          <text class="update-popup-description">{{ description }}</text>
        </scroll-view>

        <progress
          v-if="downloadProgress > 0 && downloadProgress < 100"
          :percent="downloadProgress"
          stroke-width="6"
          activeColor="#409eff"
          backgroundColor="#ebeef5"
          class="download-progress"
        ></progress>
        <text
          v-if="downloadProgress > 0 && downloadProgress < 100"
          class="download-progress-text"
          >{{ downloadProgress.toFixed(0) }}%</text
        >

        <view class="update-popup-actions">
          <button
            v-if="!forceUpdate && downloadProgress === 0"
            class="action-button cancel-button"
            @click="closePopup"
          >
            取消
          </button>
          <button
            class="action-button update-button"
            :class="{ 'full-width': forceUpdate || downloadProgress > 0 }"
            @click="handleUpdate"
          >
            {{
              downloadProgress > 0 && downloadProgress < 100
                ? "下载中..."
                : "立即更新"
            }}
          </button>
        </view>
        <view v-if="forceUpdate" class="force-update-tip">
          <text>本次更新为重要版本，请务必更新！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  // 是否显示弹窗
  show: {
    type: Boolean,
    default: false,
  },
  // 新版本号
  version: {
    type: String,
    default: "1.0.0",
  },
  // 更新描述
  description: {
    type: String,
    default: "修复已知问题，优化用户体验。",
  },
  // APK 下载链接 (仅限 Android)
  apkUrl: {
    type: String,
    default: "",
  },
  // 是否强制更新
  forceUpdate: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "confirm-update"]);

const showPopup = ref(props.show);
const downloadProgress = ref(0); // 下载进度 0-100

// 监听 props.show 变化来控制弹窗显示隐藏
watch(
  () => props.show,
  (newVal) => {
    showPopup.value = newVal;
    if (!newVal) {
      // 弹窗关闭时重置下载进度
      downloadProgress.value = 0;
    }
  },
);

// 关闭弹窗
const closePopup = () => {
  if (props.forceUpdate) {
    // 强制更新不能关闭
    return;
  }
  showPopup.value = false;
  emit("close");
};

// 处理更新逻辑
const handleUpdate = () => {
  showPopup.value = false;
  uni.$devToast();
  return;
  // if (downloadProgress.value > 0 && downloadProgress.value < 100) {
  //   // 正在下载中，不重复触发
  //   return;
  // }

  // // 触发父组件的更新事件，父组件可以进行真正的下载或跳转商店
  // emit("confirm-update");

  // // 模拟下载过程 (仅用于示例，实际应用中会通过 uni.downloadFile 实现)
  // if (uni.getSystemInfoSync().platform === "android" && props.apkUrl) {
  //   downloadApk();
  // } else if (uni.getSystemInfoSync().platform === "ios") {
  //   // iOS 通常是跳转 App Store
  //   uni.showToast({
  //     title: "即将跳转 App Store",
  //     icon: "none",
  //   });
  //   // 实际应用中会根据情况跳转到 App Store 页面
  //   // 例如：plus.runtime.openURL('https://apps.apple.com/cn/app/...');
  // } else {
  //   uni.showToast({
  //     title: "当前平台不支持自动更新，请前往官网下载",
  //     icon: "none",
  //   });
  // }
};

// 模拟 Android APK 下载
// const downloadTask = ref(null);
// const downloadApk = () => {
//   uni.showLoading({
//     title: "准备下载...",
//   });

//   downloadProgress.value = 1; // 开始下载，将进度设置为1，显示进度条

//   downloadTask.value = uni.downloadFile({
//     url: props.apkUrl,
//     success: (res) => {
//       if (res.statusCode === 200) {
//         uni.hideLoading();
//         uni.showToast({
//           title: "下载完成，开始安装...",
//           icon: "none",
//         });
//         downloadProgress.value = 100; // 下载完成

//         // 安装 APK
//         // #ifdef APP-PLUS
//         plus.runtime.install(
//           res.tempFilePath,
//           {
//             force: true, // 强制安装
//           },
//           () => {
//             uni.showToast({
//               title: "安装成功！",
//               icon: "success",
//             });
//             // 安装完成后，如果不是强制更新，可以关闭弹窗
//             if (!props.forceUpdate) {
//               closePopup();
//             }
//           },
//           (e) => {
//             console.error("安装失败：", e);
//             uni.showToast({
//               title: "安装失败，请手动安装",
//               icon: "error",
//             });
//             downloadProgress.value = 0; // 重置进度
//           },
//         );
//         // #endif
//       } else {
//         uni.hideLoading();
//         uni.showToast({
//           title: "下载失败，请重试",
//           icon: "error",
//         });
//         downloadProgress.value = 0; // 重置进度
//       }
//     },
//     fail: (err) => {
//       uni.hideLoading();
//       console.error("下载失败：", err);
//       uni.showToast({
//         title: "下载失败，请检查网络",
//         icon: "error",
//       });
//       downloadProgress.value = 0; // 重置进度
//     },
//   });

//   downloadTask.value.onProgressUpdate((res) => {
//     downloadProgress.value = res.progress;
//   });
// };
</script>

<style lang="scss" scoped>
.update-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .update-popup-content {
    background-color: #fff;
    border-radius: 16rpx;
    width: 600rpx;
    overflow: visible; /* 允许子元素超出边界 */
    position: relative; /* 为子元素的绝对定位提供参考 */
    display: flex;
    flex-direction: column;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    padding-top: 80rpx; /* 为图片留出顶部空间 */

    .upgrade-icon {
      position: absolute;
      top: -80rpx; /* 向上偏移，具体数值根据图片大小和设计调整 */
      left: 50%;
      transform: translateX(-50%); /* 水平居中 */
      width: 240rpx; /* 根据图片实际大小调整 */
      height: auto;
      z-index: 10000; /* 确保图片在最上层 */
    }

    .update-popup-main {
      padding: 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #fff; /* 确保内容区域背景是白色 */
      border-radius: 16rpx; /* 确保圆角 */
      position: relative; /* 确保内容在图片下方 */

      .update-popup-title {
        font-size: 38rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
      }

      .update-popup-scroll-view {
        max-height: 200rpx; // 限制内容高度，超出可滚动
        width: 100%;
        margin-bottom: 40rpx;
      }

      .update-popup-description {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        white-space: pre-wrap; // 保留换行符和空格
      }

      .download-progress {
        width: 100%;
        margin-top: 20rpx;
        margin-bottom: 10rpx;
      }

      .download-progress-text {
        font-size: 24rpx;
        color: #409eff;
        margin-bottom: 30rpx;
      }

      .update-popup-actions {
        display: flex;
        width: 100%;
        gap: 20rpx;

        .action-button {
          flex: 1;
          height: 80rpx;
          line-height: 80rpx;
          border-radius: 40rpx;
          font-size: 32rpx;
          text-align: center;
          border: none;
          padding: 0; // 移除默认padding
          &::after {
            // 移除button自带的边框
            border: none;
          }

          &.cancel-button {
            background-color: #f2f2f2;
            color: #666;
          }

          &.update-button {
            background-color: #409eff;
            color: #fff;

            &.full-width {
              flex: none;
              width: 100%;
            }
          }
        }
      }

      .force-update-tip {
        margin-top: 30rpx;
        font-size: 24rpx;
        color: #f56c6c;
        text-align: center;
      }
    }
  }
}
</style>
