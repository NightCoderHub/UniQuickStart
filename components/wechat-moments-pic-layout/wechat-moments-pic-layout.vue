<template>
  <view class="wechat-moments-pic-layout">
    <view v-if="images.length === 1" class="single-image-wrapper">
      <muqian-lazyLoad
        :src="images[0]"
        mode="widthFix"
        width="640rpx"
        class="single-image"
        @click="openPreview(0)"
      ></muqian-lazyLoad>
    </view>

    <view v-else-if="images.length === 2" class="double-image-wrapper">
      <muqian-lazyLoad
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        height="300rpx"
        class="double-image"
        @click="openPreview(index)"
      ></muqian-lazyLoad>
    </view>

    <view v-else-if="images.length === 3" class="triple-image-wrapper">
      <muqian-lazyLoad
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        mode="aspectFill"
        height="200rpx"
        class="triple-image"
        @click="openPreview(index)"
      ></muqian-lazyLoad>
    </view>

    <view v-else-if="images.length === 4" class="quad-image-wrapper">
      <view v-for="i in 2" :key="i - 1" class="quad-row">
        <muqian-lazyLoad
          v-for="(image, index) in images.slice((i - 1) * 2, i * 2)"
          :key="index + (i - 1) * 2"
          :src="image"
          mode="aspectFill"
          height="240rpx"
          class="quad-image"
          @click="openPreview(index + (i - 1) * 2)"
        ></muqian-lazyLoad>
      </view>
    </view>

    <view
      v-else-if="images.length >= 5 && images.length <= 9"
      class="grid-layout-native"
    >
      <view
        v-for="(image, index) in images"
        :key="index"
        class="grid-item-native"
      >
        <muqian-lazyLoad
          :src="image"
          mode="aspectFill"
          height="200rpx"
          @click="openPreview(index)"
        ></muqian-lazyLoad>
      </view>
    </view>

    <view v-if="previewVisible" class="image-preview-overlay">
      <view class="preview-header">
        <view class="close-btn" @click="closePreview">×</view>
        <view class="indicator"
          >{{ currentPreviewIndex + 1 }} / {{ images.length }}</view
        >
      </view>

      <swiper
        class="preview-swiper"
        :current="currentPreviewIndex"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        @change="swiperChange"
      >
        <swiper-item
          v-for="(item, index) in images"
          :key="index"
          class="swiper-item-content"
        >
          <image
            :src="item"
            mode="aspectFit"
            class="preview-image"
            @load="imageLoadSuccess(index)"
            @error="imageLoadError(index)"
          ></image>
          <view v-if="previewLoadingMap[index]" class="image-loading"
            >加载中...</view
          >
          <view v-if="previewErrorMap[index]" class="image-error"
            >加载失败</view
          >
        </swiper-item>
      </swiper>

      <view class="preview-footer">
        <button class="save-btn" @click="saveCurrentImage">保存图片</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";

// Props
const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
});

// --- 图片预览和保存逻辑 ---
const previewVisible = ref(false);
const currentPreviewIndex = ref(0);
const previewLoadingMap = reactive({});
const previewErrorMap = reactive({});

const openPreview = (initialIdx) => {
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
    if (
      err.errMsg &&
      (err.errMsg.includes("auth deny") || err.errMsg.includes("denied"))
    ) {
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
.wechat-moments-pic-layout {
  width: 100%;
  box-sizing: border-box;
  .single-image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .double-image-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 8rpx;
  }

  .triple-image-wrapper {
    display: flex;
    gap: 8rpx;
  }

  .quad-image-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    .quad-row {
      display: flex;
      gap: 8rpx;
    }
  }

  .grid-layout-native {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;

    .grid-item-native {
      width: calc((100% - 2 * 8rpx) / 3);
      box-sizing: border-box;
      &:nth-child(3n + 1):last-child:nth-last-child(-n + 2),
      &:nth-child(3n + 2):last-child:nth-last-child(-n + 1) {
        margin-right: auto;
      }
    }
  }

  /* --- 图片预览叠加层样式 --- */
  .image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000;
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .preview-header {
      position: absolute;
      top: var(--status-bar-height);
      left: 0;
      right: 0;
      height: 80rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30rpx;
      color: #fff;
      font-size: 32rpx;
      z-index: 10000;

      .close-btn {
        font-size: 60rpx;
        line-height: 1;
        padding: 0 10rpx;
      }
      .indicator {
        margin-left: auto;
      }
    }

    .preview-swiper {
      width: 100%;
      height: 100%;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      .swiper-item-content {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .preview-image {
          width: 100%;
          height: 100%;
        }

        .image-loading,
        .image-error {
          position: absolute;
          color: #fff;
          font-size: 28rpx;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 10rpx 20rpx;
          border-radius: 10rpx;
        }
      }
    }

    .preview-footer {
      position: absolute;
      bottom: env(safe-area-inset-bottom);
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20rpx 0;
      z-index: 10000;

      .save-btn {
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 28rpx;
        padding: 10rpx 30rpx;
        border-radius: 40rpx;
        line-height: normal;
        &:active {
          background-color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
}
</style>
