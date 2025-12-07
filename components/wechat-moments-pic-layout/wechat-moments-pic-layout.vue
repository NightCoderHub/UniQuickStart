<template>
  <view class="wechat-moments-pic-layout">
    <!-- 单张图片布局 -->
    <view v-if="images.length === 1" class="single-image-wrapper">
      <muqian-lazyLoad
        :src="images[0]"
        mode="widthFix"
        width="500rpx"
        height="auto"
        class="single-image"
        border-radius="8rpx"
        @click="openPreview(0)"
      ></muqian-lazyLoad>
    </view>

    <!-- 多张图片网格布局 (2-9张) -->
    <!-- 2张或4张显示为2列，其他显示为3列 -->
    <view v-else-if="images.length > 1" class="grid-layout" :class="gridClass">
      <view v-for="(image, index) in images" :key="index" class="grid-item">
        <muqian-lazyLoad
          :src="image"
          mode="aspectFill"
          width="100%"
          height="100%"
          border-radius="8rpx"
          @click="openPreview(index)"
        ></muqian-lazyLoad>
      </view>
    </view>

    <!-- 图片预览组件 -->
    <view v-if="previewVisible" class="image-preview-overlay" @touchmove.stop.prevent @click="closePreview">
      <view class="preview-header" @click.stop>
        <view class="close-btn" @click="closePreview">
          <wd-icon name="close" size="20rpx" color="#fff"></wd-icon>
        </view>
        <view class="indicator">
          <text class="current">{{ currentPreviewIndex + 1 }}</text>
          <text class="divider">/</text>
          <text class="total">{{ images.length }}</text>
        </view>
        <view class="header-placeholder"></view>
      </view>

      <swiper
        class="preview-swiper"
        :current="currentPreviewIndex"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        :duration="300"
        @change="swiperChange"
      >
        <swiper-item v-for="(item, index) in images" :key="index" class="swiper-item-content">
          <image
            :src="item"
            mode="aspectFit"
            class="preview-image"
            @load="imageLoadSuccess(index)"
            @error="imageLoadError(index)"
            @click.stop="closePreview"
          ></image>
          <view v-if="previewLoadingMap[index]" class="state-container loading">
            <wd-loading size="30px" color="#fff" />
          </view>
          <view v-if="previewErrorMap[index]" class="state-container error">
            <wd-icon name="warn-bold" color="#ff4d4f" size="32px"></wd-icon>
            <text class="error-text">加载失败</text>
          </view>
        </swiper-item>
      </swiper>

      <view class="preview-footer" @click.stop>
        <view class="save-btn" @click="saveCurrentImage">
          <wd-icon name="download" size="30rpx" color="#fff" style="margin-right: 8rpx"></wd-icon>
          <text>保存图片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

// Props
const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
});

// 计算网格列数类名
const gridClass = computed(() => {
  const len = props.images.length;
  // 2张或4张图片时，使用2列布局 (类似微信朋友圈逻辑)
  if (len === 2 || len === 4) {
    return "grid-2-cols";
  }
  // 其他情况 (3, 5-9) 使用3列布局
  return "grid-3-cols";
});

// --- 图片预览和保存逻辑 ---
const previewVisible = ref(false);
const currentPreviewIndex = ref(0);
const previewLoadingMap = reactive({});
const previewErrorMap = reactive({});

const openPreview = (initialIdx) => {
  console.log("openPreview", initialIdx);
  if (props.images.length === 0) {
    uni.showToast({ title: "没有图片可预览", icon: "none" });
    return;
  }
  previewVisible.value = true;
  currentPreviewIndex.value = initialIdx;
  props.images.forEach((_, index) => {
    previewLoadingMap[index] = true;
    previewErrorMap[index] = false;
  });
};

const closePreview = () => {
  previewVisible.value = false;
};

const swiperChange = (e) => {
  currentPreviewIndex.value = e.detail.current;
};

const imageLoadSuccess = (index) => {
  previewLoadingMap[index] = false;
  previewErrorMap[index] = false;
};

const imageLoadError = (index) => {
  previewLoadingMap[index] = false;
  previewErrorMap[index] = true;
  uni.showToast({ title: "图片加载失败", icon: "none" });
};

const saveCurrentImage = async () => {
  if (props.images.length === 0) return;
  const imageUrl = props.images[currentPreviewIndex.value];

  if (!imageUrl) {
    uni.showToast({ title: "当前图片地址无效", icon: "none" });
    return;
  }
  /* eslint-disable no-unreachable */ // 在这里禁用 no-unreachable 规则
  // #ifdef H5
  // H5 平台特殊处理：提示用户长按图片保存
  uni.showToast({
    title: "在浏览器中请长按图片保存",
    icon: "none",
  });
  return;
  // #endif

  // #ifndef H5
  // 非 H5 平台（App、小程序等）才尝试调用 saveImageToPhotosAlbum
  uni.showLoading({ title: "保存中..." });

  try {
    const downloadRes = await uni.downloadFile({ url: imageUrl });

    if (downloadRes.statusCode === 200) {
      const tempFilePath = downloadRes.tempFilePath;
      await uni.saveImageToPhotosAlbum({ filePath: tempFilePath });
      uni.hideLoading();
      uni.showToast({ title: "保存成功", icon: "success" });
    } else {
      uni.hideLoading();
      uni.showToast({ title: "图片下载失败", icon: "none" });
      console.error("图片下载失败:", downloadRes);
    }
  } catch (err) {
    uni.hideLoading();
    if (err.errMsg && (err.errMsg.includes("auth deny") || err.errMsg.includes("denied"))) {
      uni.showModal({
        title: "权限提示",
        content: "需要获取您的相册权限才能保存图片，请前往设置开启。",
        confirmText: "去设置",
        success: (modalRes) => {
          if (modalRes.confirm) {
            uni.openSetting();
          }
        },
      });
    } else {
      uni.showToast({ title: "保存失败", icon: "error" });
      console.error("保存图片失败:", err);
    }
  }
  // #endif
  /* eslint-enable no-unreachable */ // 在这里重新启用 no-unreachable 规则
};
</script>

<style lang="scss" scoped>
image {
  will-change: transform;
}

.wechat-moments-pic-layout {
  box-sizing: border-box;
  width: 100%;

  .single-image-wrapper {
    display: flex;
    justify-content: flex-start;
    width: 100%;

    .single-image {
      min-height: 200rpx;
    }
  }

  .grid-layout {
    display: grid;
    gap: 8rpx;
    width: 100%;

    &.grid-2-cols {
      grid-template-columns: repeat(2, 1fr);

      // 2列时，限制总宽度，使其不占满整行 (仿微信朋友圈2张图效果)
      width: 70%;
    }

    &.grid-3-cols {
      grid-template-columns: repeat(3, 1fr);
    }

    .grid-item {
      position: relative;
      width: 100%;

      // 使用 aspect-ratio 保持正方形 (1:1)
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: 8rpx;
    }
  }

  /* --- 图片预览叠加层样式 --- */
  .image-preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #000;
    animation: fadeIn 0.25s ease-out;

    .preview-header {
      position: absolute;
      top: var(--status-bar-height);
      right: 0;
      left: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100rpx;
      padding-top: var(--status-bar-height);
      padding-right: 32rpx;
      padding-left: 32rpx;
      background: linear-gradient(to bottom, rgb(0 0 0 / 50%), transparent);

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44rpx;
        height: 44rpx;
        background: rgb(255 255 255 / 15%);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        transition: all 0.2s;

        &:active {
          background: rgb(255 255 255 / 30%);
          transform: scale(0.95);
        }
      }

      .indicator {
        display: flex;
        gap: 6rpx;
        align-items: center;
        padding: 8rpx 24rpx;
        background: rgb(0 0 0 / 30%);
        backdrop-filter: blur(10px);
        border: 1px solid rgb(255 255 255 / 10%);
        border-radius: 32rpx;

        .current {
          font-size: 30rpx;
          font-weight: 600;
          color: #fff;
        }

        .divider {
          font-size: 24rpx;
          color: rgb(255 255 255 / 60%);
        }

        .total {
          font-size: 24rpx;
          color: rgb(255 255 255 / 80%);
        }
      }

      .header-placeholder {
        width: 64rpx;
      }
    }

    .preview-swiper {
      flex: 1;
      width: 100%;
      height: 100%;

      .swiper-item-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        .preview-image {
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .state-container {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 16rpx;
          align-items: center;
          transform: translate(-50%, -50%);

          &.error {
            padding: 32rpx;
            background: rgb(0 0 0 / 60%);
            backdrop-filter: blur(4px);
            border-radius: 16rpx;

            .error-text {
              font-size: 26rpx;
              color: #fff;
              opacity: 0.9;
            }
          }
        }
      }
    }

    .preview-footer {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 60rpx;
      padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
      background: linear-gradient(to top, rgb(0 0 0 / 60%), transparent);

      .save-btn {
        display: flex;
        align-items: center;
        padding: 16rpx 48rpx;
        font-size: 28rpx;
        font-weight: 500;
        color: #fff;
        background: rgb(255 255 255 / 20%);
        backdrop-filter: blur(10px);
        border: 1px solid rgb(255 255 255 / 30%);
        border-radius: 100rpx;
        transition: all 0.2s;

        &:active {
          background: rgb(255 255 255 / 35%);
          transform: scale(0.98);
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
