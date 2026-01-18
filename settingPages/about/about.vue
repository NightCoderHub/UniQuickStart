<template>
  <view class="container">
    <!-- 头部 Logo 区域 -->
    <view class="header-section">
      <view class="logo-box">
        <image class="app-logo" src="/static/logo.png" mode="aspectFit"></image>
      </view>
      <text class="app-name">{{ APP_CONFIG.name }}</text>
      <view class="version-tag">
        <text>Version {{ version }}</text>
      </view>
    </view>

    <!-- 简介卡片 -->
    <view class="card description-card">
      <view class="card-title">关于我们</view>
      <text class="app-description">{{ COMPANY_INFO.description }}</text>
    </view>

    <!-- 菜单列表 -->
    <view class="card menu-card">
      <view class="menu-item" @click="navigateTo('/settingPages/legal/privacy-policy')">
        <view class="item-left">
          <view class="icon-wrapper blue">
            <wd-icon name="file-paste" size="18px" color="#4c92fc"></wd-icon>
          </view>
          <text class="item-label">隐私政策</text>
        </view>
        <wd-icon name="arrow-right" size="16px" color="#ccc"></wd-icon>
      </view>

      <view class="menu-item" @click="navigateTo('/settingPages/legal/user-agreement')">
        <view class="item-left">
          <view class="icon-wrapper orange">
            <wd-icon name="read" size="18px" color="#ff9900"></wd-icon>
          </view>
          <text class="item-label">用户协议</text>
        </view>
        <wd-icon name="arrow-right" size="16px" color="#ccc"></wd-icon>
      </view>

      <view class="menu-item" @click="copyToClipboard(COMPANY_INFO.website)">
        <view class="item-left">
          <view class="icon-wrapper green">
            <wd-icon name="internet" size="18px" color="#07c160"></wd-icon>
          </view>
          <text class="item-label">官方网站</text>
        </view>
        <view class="item-right">
          <text class="item-value">{{ COMPANY_INFO.website }}</text>
          <wd-icon name="copy" size="14px" color="#999"></wd-icon>
        </view>
      </view>

      <view class="menu-item" @click="copyToClipboard(COMPANY_INFO.email)">
        <view class="item-left">
          <view class="icon-wrapper purple">
            <wd-icon name="mail" size="18px" color="#722ed1"></wd-icon>
          </view>
          <text class="item-label">联系我们</text>
        </view>
        <view class="item-right">
          <text class="item-value">{{ COMPANY_INFO.email }}</text>
          <wd-icon name="copy" size="14px" color="#999"></wd-icon>
        </view>
      </view>
    </view>

    <!-- 底部版权 -->
    <view class="footer-section">
      <text class="copyright">Copyright © {{ currentYear }} {{ COMPANY_INFO.copyright }}. All Rights Reserved.</text>
    </view>
  </view>
</template>

<script setup>
import { COMPANY_INFO, APP_CONFIG } from "@/utils/constants";
import { useDeviceStore } from "@/stores";

const deviceStore = useDeviceStore();
const version = deviceStore.appBaseInfo.appVersion;

const currentYear = new Date().getFullYear();
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
        title: "已复制",
        icon: "none",
      });
    },
    fail: (err) => {
      console.error("复制失败", err);
    },
  });
};
</script>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 30rpx;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .logo-box {
    box-sizing: border-box;
    width: 160rpx;
    height: 160rpx;
    padding: 20rpx;
    margin-bottom: 24rpx;
    background: #fff;
    border-radius: 32rpx;
    box-shadow: 0 8rpx 24rpx rgb(0 0 0 / 6%);

    .app-logo {
      width: 100%;
      height: 100%;
    }
  }

  .app-name {
    margin-bottom: 16rpx;
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }

  .version-tag {
    padding: 6rpx 20rpx;
    background: rgb(76 146 252 / 10%);
    border-radius: 24rpx;

    text {
      font-size: 24rpx;
      font-weight: 500;
      color: #4c92fc;
    }
  }
}

.card {
  padding: 0 30rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgb(0 0 0 / 2%);

  &.description-card {
    padding: 30rpx;

    .card-title {
      margin-bottom: 16rpx;
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }

    .app-description {
      font-size: 26rpx;
      line-height: 1.6;
      color: #666;
      text-align: justify;
    }
  }
}

.menu-card {
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .item-left {
      display: flex;
      gap: 20rpx;
      align-items: center;

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;

        &.blue {
          background: rgb(76 146 252 / 10%);
        }

        &.orange {
          background: rgb(255 153 0 / 10%);
        }

        &.green {
          background: rgb(7 193 96 / 10%);
        }

        &.purple {
          background: rgb(114 46 209 / 10%);
        }
      }

      .item-label {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
      }
    }

    .item-right {
      display: flex;
      gap: 8rpx;
      align-items: center;

      .item-value {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

.footer-section {
  padding: 40rpx 0;
  margin-top: auto;
  text-align: center;

  .copyright {
    font-size: 22rpx;
    color: #ccc;
  }
}
</style>
