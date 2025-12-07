<template>
  <view class="container">
    <image class="page-bg" src="/static/user_index.png" mode="widthFix" />
    <status-bar-placeholder></status-bar-placeholder>
    <!-- <custom-nav-bar></custom-nav-bar> -->

    <!-- 主内容区域 -->
    <view class="content">
      <!-- 用户信息卡片 -->
      <view class="user-card" @click="goToProfile">
        <image class="avatar" :src="userStore.userAvatar" mode="aspectFill" />
        <view class="user-info">
          <text class="username">{{ userStore.userName }}</text>
          <text class="subtitle">编辑/个人信息查看</text>
        </view>
        <view class="arrow">
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 我的订单 -->
      <view class="section-card">
        <text class="section-title">我的订单</text>
        <view class="order-grid">
          <view v-for="item in orderItems" :key="item.id" class="order-item" @click="handleOrderClick(item)">
            <view class="icon-wrapper">
              <image class="icon-text" :src="'/static/' + item.type + '_order.png'" mode="aspectFill" />
            </view>
            <text class="item-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 工具与服务 -->
      <view class="section-card">
        <text class="section-title">工具与服务</text>
        <view class="service-grid">
          <view v-for="item in serviceItems" :key="item.id" class="service-item" @click="handleServiceClick(item)">
            <view class="service-icon-wrapper">
              <image style="width: 100%; height: 100%" :src="'/static/' + item.icon + '.png'" mode="aspectFill" />
            </view>
            <text class="item-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <custom-tabbar current-path="pages/me/index"></custom-tabbar>
  </view>
</template>

<script setup>
import { reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores";

onLoad(() => {
  uni.hideTabBar();
});

const userStore = useUserStore();

// 订单菜单项
const orderItems = reactive([
  { id: 1, label: "全部", type: "all" },
  { id: 2, label: "待接单", type: "pending" },
  { id: 3, label: "待支付", type: "incomplete" },
  { id: 4, label: "已完成", type: "completed" },
]);

// 工具与服务菜单项
const serviceItems = reactive([
  {
    id: 1,
    icon: "verify",
    label: "实名认证",
    path: "/settingPages/verify/verify",
  },
  {
    id: 2,
    icon: "join",
    label: "师傅入驻",
    path: "/moreServicePages/expert-join/expert-join",
  },
  {
    id: 3,
    icon: "help",
    label: "帮助中心",
    path: "/settingPages/help-feedback/help-center",
  },
  {
    id: 4,
    icon: "service",
    label: "客服中心",
    path: "/settingPages/help-feedback/customer-service",
  },
  {
    id: 5,
    icon: "address",
    label: "地址管理",
    path: "/pages/address/address-select",
  },
  {
    id: 6,
    icon: "consult",
    label: "合作咨询",
    path: "/moreServicePages/regional-cooperation/regional-cooperation",
  },
  {
    id: 7,
    icon: "feedback",
    label: "意见反馈",
    path: "/settingPages/help-feedback/feedback",
  },
  {
    id: 8,
    icon: "about",
    label: "关于我们",
    path: "/settingPages/about/about",
  },
  {
    id: 9,
    icon: "master",
    label: "师傅端",
    path: "/pages/technician-portal/technician-portal",
  },
  {
    id: 10,
    icon: "favorite",
    label: "收藏师傅",
    path: "/pages/favorite-technicians/favorite-technicians",
  },
  {
    id: 11,
    icon: "message",
    label: "消息中心",
    path: "/settingPages/notifications/notifications",
  },
]);

// 跳转到个人资料页
const goToProfile = () => {
  uni.navigateTo({
    url: "/pages/settings/settings",
  });
};

// 处理订单点击
const handleOrderClick = (item) => {
  uni.navigateTo({
    url: `/pages/orders/list?type=${item.type}`,
  });
};

// 处理服务点击
const handleServiceClick = (item) => {
  uni.navigateTo({
    url: item.path,
  });
};
</script>

<style scoped lang="scss">
.container {
  position: relative;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
}

.content {
  position: relative;
  z-index: 1;
  padding: 180rpx 24rpx 24rpx;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background-color: #fff;
  border-radius: $uni-border-radius-lg;
  box-shadow: 0 4rpx 20rpx rgb(0 0 0 / 5%);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  margin-right: 24rpx;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.username {
  margin-bottom: 8rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  font-size: 26rpx;
  color: #999;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
}

.arrow-icon {
  font-size: 36rpx;
  color: #ccc;
}

/* 区块卡片 */
.section-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
  background-color: #fff;
  border-radius: $uni-border-radius-lg;
}

.section-title {
  display: block;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* 订单网格 */
.order-grid {
  display: flex;
  justify-content: space-around;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.icon-text {
  width: 72rpx;
  height: 72rpx;
}

/* 服务网格 */
.service-grid {
  display: flex;
  flex-wrap: wrap;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  margin-bottom: 40rpx;
}

.service-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
  background-color: white;
  border-radius: $uni-border-radius-lg;
}

.item-label {
  font-size: 24rpx;
  color: #000;
}
</style>
