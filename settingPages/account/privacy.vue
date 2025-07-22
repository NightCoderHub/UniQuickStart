<template>
  <view class="container">
    <custom-nav-bar title="隐私设置"></custom-nav-bar>
    <view class="setting-list">
      <view class="setting-item" @click="navigateToPrivacyPolicy">
        <text class="item-text">隐私政策</text>
        <text class="arrow">></text>
      </view>
      <view class="setting-item">
        <text class="item-text">个性化推荐</text>
        <switch
          :checked="personalizedRecommendationEnabled"
          color="#007aff"
          @change="togglePersonalizedRecommendation"
        />
      </view>
      <view class="setting-item">
        <text class="item-text">允许访问位置信息</text>
        <switch
          :checked="locationAccessEnabled"
          color="#007aff"
          @change="toggleLocationAccess"
        />
      </view>
      <view class="setting-item" @click="navigateToNotificationSettings">
        <text class="item-text">通知设置</text>
        <text class="arrow">></text>
      </view>
      <view class="setting-item" @click="navigateToAccountDeletion">
        <text class="item-text">注销账户</text>
        <text class="arrow">></text>
      </view>
      <!-- 更多隐私设置项 -->
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import CustomNavBar from "@/components/custom-nav-bar/custom-nav-bar.vue";

const personalizedRecommendationEnabled = ref(true);
const locationAccessEnabled = ref(true);

const navigateToPrivacyPolicy = () => {
  uni.navigateTo({
    url: "/settingPages/legal/privacy-policy", // 假设有隐私政策页面
  });
};

const togglePersonalizedRecommendation = (e) => {
  personalizedRecommendationEnabled.value = e.detail.value;
  // 调用API更新用户设置
  uni.showToast({
    title: `个性化推荐已${e.detail.value ? "开启" : "关闭"}`,
    icon: "none",
  });
};

const toggleLocationAccess = (e) => {
  locationAccessEnabled.value = e.detail.value;
  // 引导用户前往系统设置或调用API
  uni.showToast({
    title: `位置信息访问已${e.detail.value ? "开启" : "关闭"}`,
    icon: "none",
  });
};

const navigateToNotificationSettings = () => {
  uni.navigateTo({
    url: "/settingPages/notifications/notifications", // 假设有通知设置页面
  });
};

const navigateToAccountDeletion = () => {
  uni.showModal({
    title: "注销账户",
    content: "注销账户将删除您的所有数据且不可恢复，确定要继续吗？",
    success: (res) => {
      if (res.confirm) {
        // 执行注销账户逻辑
        uni.showToast({ title: "账户已注销", icon: "success" });
      }
    },
  });
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.setting-list {
  background-color: #fff;
  margin-top: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .item-text {
    font-size: 32rpx;
    color: #333;
    flex: 1;
  }

  .arrow {
    font-size: 32rpx;
    color: #999;
    margin-left: 20rpx;
  }
}
</style>
