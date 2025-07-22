<template>
  <view class="about-container">
    <view class="content-section">
      <image class="app-logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">{{ COMPANY_INFO.name }}</text>
      <text class="app-slogan">{{ COMPANY_INFO.slogan }}</text>
      <text class="app-version">版本号：{{ APP_CONFIG.version }}</text>
    </view>

    <view class="app-description-section">
      <text class="app-description">{{ COMPANY_INFO.description }}</text>
    </view>

    <view class="info-list">
      <view
        class="info-item"
        @click="navigateTo('/settingPages/legal/privacy-policy')"
      >
        <text class="item-label">隐私政策</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view
        class="info-item"
        @click="navigateTo('/settingPages/legal/user-agreement')"
      >
        <text class="item-label">用户协议</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="info-item" @click="copyToClipboard(COMPANY_INFO.website)">
        <text class="item-label">官方网站</text>
        <text class="item-value">{{ COMPANY_INFO.website }}</text>
      </view>
      <view class="info-item" @click="copyToClipboard(COMPANY_INFO.email)">
        <text class="item-label">联系我们</text>
        <text class="item-value">{{ COMPANY_INFO.email }}</text>
      </view>
    </view>

    <view class="footer-section">
      <text class="copyright"
        >Copyright © 2025 早同城. All Rights Reserved.</text
      >
    </view>
  </view>
</template>

<script setup>
import { COMPANY_INFO, APP_CONFIG } from "@/constants";

const navigateTo = (url) => {
  uni.navigateTo({
    url: url,
  });
};

const copyToClipboard = (content) => {
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({
        title: "已复制到剪贴板",
        icon: "none",
      });
    },
    fail: (err) => {
      uni.showToast({
        title: "复制失败",
        icon: "none",
      });
      console.error("复制失败", err);
    },
  });
};

// 可以在这里添加获取真实版本号的逻辑，例如：
// onMounted(() => {
//   // #ifdef APP-PLUS
//   plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
//     appVersion.value = widgetInfo.version;
//   });
//   // #endif
// });
</script>

<style lang="scss" scoped>
.about-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.content-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background-color: #fff;
  margin-bottom: 20rpx;

  .app-logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }

  .app-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 10rpx;
  }

  .app-version {
    font-size: 28rpx;
    color: #999;
  }
}

.app-description-section {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  margin: 0 20rpx 20rpx;

  .app-description {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    text-align: justify;
  }
}

.info-list {
  background-color: #fff;
  padding: 0 30rpx;
  margin: 0 20rpx;
  border-radius: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .item-label {
    font-size: 30rpx;
    color: #333;
  }

  .item-value {
    font-size: 30rpx;
    color: #666;
  }

  .iconfont {
    font-size: 30rpx;
    color: #ccc;
  }
}

.footer-section {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40rpx;

  .copyright {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
