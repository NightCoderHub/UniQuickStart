<template>
  <view class="profile-page">
    <custom-nav-bar></custom-nav-bar>

    <view class="user-section">
      <view class="user-info">
        <image
          class="avatar"
          :src="userStore.userAvatar || '/static/132.png'"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <template v-if="userStore.isLoggedIn">
            <view class="user-name">{{
              userStore.userName || "用户昵称"
            }}</view>
            <view class="rating-info">
              <text class="rating">
                星级评分
                <text style="font-weight: bold">{{
                  userStore.userRating || "N/A"
                }}</text>
              </text>
              <text class="divider">|</text>
              <text class="completion">
                完单率
                <text style="font-weight: bold">{{
                  userStore.userCompletion || "N/A"
                }}</text>
              </text>
            </view>
          </template>
          <template v-else>
            <view class="login-prompt">
              <text class="login-text">您好，请登录</text>
              <button class="login-button" @click="goToLogin">去登录</button>
            </view>
          </template>
        </view>
      </view>
      <view class="settings-icon" @click="goToSettings">
        <text class="iconfont icon-setting1"></text>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-card dashboard-card">
        <view class="card-title">我的资产</view>
        <view class="dashboard-grid">
          <view class="service-item" @click="handleMenuClick('balance')">
            <text class="item-text">余额</text>
            <text class="iconfont icon-yue item-icon"></text>
          </view>
          <view class="service-item" @click="handleMenuClick('commission')">
            <text class="item-text">推广佣金</text>
            <text class="iconfont icon-tuiguangyongjin item-icon"></text>
          </view>
          <view class="service-item" @click="handleMenuClick('invoice')">
            <text class="item-text">发票报销</text>
            <text class="iconfont icon-fapiaobaoxiao item-icon"></text>
          </view>
          <view class="service-item" @click="handleMenuClick('service')">
            <text class="item-text">客服</text>
            <text class="iconfont icon-kefu item-icon"></text>
          </view>
        </view>
      </view>

      <view class="menu-card">
        <view class="card-title">常用功能</view>
        <view class="menu-grid">
          <view class="menu-item" @click="handleMenuClick('orders')">
            <text class="iconfont icon-dingdan menu-icon"></text>
            <text class="menu-text">订单</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('info')">
            <text class="iconfont icon-xinxi menu-icon"></text>
            <text class="menu-text">信息</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('address')">
            <text class="iconfont icon-dizhibao menu-icon"></text>
            <text class="menu-text">地址薄</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('favorite')">
            <text class="iconfont icon-shoucangshifu menu-icon"></text>
            <text class="menu-text">收藏师傅</text>
          </view>
        </view>
      </view>

      <view class="menu-card">
        <view class="card-title">更多服务</view>
        <view class="menu-grid">
          <view class="menu-item" @click="handleMenuClick('expert')">
            <text class="iconfont icon-zhuanjiajiaru menu-icon"></text>
            <text class="menu-text">专家加入</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('enterprise')">
            <text class="iconfont icon-qiyeyongren2 menu-icon"></text>
            <text class="menu-text">企业用人</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('regional')">
            <text class="iconfont icon-quyuhezuo2 menu-icon"></text>
            <text class="menu-text">区域合作</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('community')">
            <text class="iconfont icon-quyuhezuo1 menu-icon"></text>
            <text class="menu-text">社区合作</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('share')">
            <text class="iconfont icon-fenxianghuanqian menu-icon"></text>
            <text class="menu-text">分享换钱</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('invite')">
            <text class="iconfont icon-yaoqingdeyongjin menu-icon"></text>
            <text class="menu-text">邀请得现金</text>
          </view>
          <view class="menu-item" @click="handleMenuClick('feedback')">
            <text class="iconfont icon-yijianfankui menu-icon"></text>
            <text class="menu-text">意见反馈</text>
          </view>
          <view
            v-if="userStore.isLoggedIn"
            class="menu-item"
            @click="handleMenuClick('master')"
          >
            <text class="iconfont icon-shifuduan menu-icon"></text>
            <text class="menu-text">师傅端</text>
          </view>
        </view>
      </view>
    </view>
  </view>
  <custom-tabbar current-path="pages/me/index"></custom-tabbar>
</template>

<script setup>
import { useUserStore } from "@/stores";

const userStore = useUserStore();

const showDevMessage = () => {
  uni.$devToast();
};

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/index",
  });
};

// 跳转到设置页面
const goToSettings = () => {
  uni.navigateTo({
    url: "/pages/settings/settings",
  });
};

const handleMenuClick = (type) => {
  console.log("点击菜单:", type);
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: "登录后即可使用此功能",
      icon: "none",
    });
    setTimeout(() => {
      goToLogin();
    }, 1000);
    return;
  }
  // 处理菜单点击事件
  switch (type) {
    case "balance":
      uni.navigateTo({
        url: "/assetsPages/balance/balance",
      });
      break;
    case "orders":
      uni.navigateTo({
        url: "/pages/orders/list",
      });
      break;
    case "commission":
      uni.navigateTo({
        url: "/assetsPages/commission/commission",
      });
      break;
    case "service":
      uni.showToast({
        title: "客服功能开发中",
        icon: "none",
      });
      break;
    case "master":
      uni.navigateTo({
        url: "/pages/technician-portal/technician-portal",
      });
      break;
    case "address":
      uni.navigateTo({
        url: "/pages/address/address-select",
      });
      break;
    case "feedback":
      uni.navigateTo({
        url: "/pages/feedback/feedback",
      });
      break;
    case "info":
      uni.navigateTo({
        url: "/settingPages/account/profile",
      });
      break;
    case "invoice":
      uni.navigateTo({
        url: "/assetsPages/invoice/invoice",
      });
      break;
    case "favorite":
      uni.navigateTo({
        url: "/pages/favorite-technicians/favorite-technicians",
      });
      break;
    case "expert":
      uni.navigateTo({
        url: "/moreServicePages/expert-join/expert-join",
      });
      break;
    case "enterprise":
      uni.navigateTo({
        url: "/moreServicePages/enterprise-recruitment/enterprise-recruitment",
      });
      break;
    case "regional":
      uni.navigateTo({
        url: "/moreServicePages/regional-cooperation/regional-cooperation",
      });

      break;
    case "community":
      uni.navigateTo({
        url: "/moreServicePages/community-cooperation/community-cooperation",
      });

      break;
    case "share":
      uni.navigateTo({
        url: "/moreServicePages/share-for-cash/share-for-cash",
      });

      break;
    case "invite":
      // uni.navigateTo({
      //   url: "/moreServicePages/invite-for-cash/invite-for-cash",
      // });
      uni.$devToast();
      break;
    default:
      showDevMessage();
  }
};
</script>

<style lang="scss" scoped>
.profile-page {
  background: linear-gradient(0deg, #f2f3f8 0%, rgba(64, 195, 147, 0.5) 100%);
  min-height: 100vh;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 40rpx;
  position: relative;
  z-index: 1;

  .user-info {
    display: flex;
    align-items: center;
    flex: 1;

    .avatar {
      width: 152rpx;
      height: 152rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.8);
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 152rpx; // 确保未登录时也有足够高度

      .user-name {
        font-size: 48rpx;
        font-family: PingFangSC-Medium;
        color: #000;
        margin-bottom: 10rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rating-info {
        display: flex;
        align-items: center;
        gap: 20rpx;
        color: $color-gray-800;
        font-size: 24rpx;

        .divider {
          color: $color-gray-800;
        }
      }

      .login-prompt {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .login-text {
          font-size: 36rpx;
          color: #000;
          margin-bottom: 20rpx;
          font-weight: 600;
        }

        .login-button {
          background-color: $color-success;
          color: #ffffff;
          padding: 10rpx 40rpx;
          font-size: 28rpx;
          border-radius: 40rpx;
          height: auto;
          line-height: normal;
          margin: 0;
          &::after {
            border: none;
          }
        }
      }
    }
  }

  .settings-icon {
    margin-left: auto;
    padding: 20rpx;
    .iconfont {
      font-size: 44rpx;
      color: #333333;
    }
  }
}

.menu-section {
  padding: 0 24rpx;
  position: relative;
  z-index: 2;

  .menu-card {
    border-radius: 24rpx;
    background: #ffffff;
    margin-bottom: 30rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $color-text-heading;
      padding: 30rpx 40rpx 0;
    }

    &.dashboard-card {
      .dashboard-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-evenly;
        padding: 30rpx 12rpx;
        border-bottom: 1rpx solid #f0f0f0;

        .service-item {
          width: 45%;
          height: 90rpx;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 30rpx;
          color: $color-text-heading;
          font-weight: 600;
          padding: 0 20rpx;
          border-radius: 12rpx;
          transition: background-color 0.2s ease-in-out;

          &:active {
            background-color: #f5f5f5;
          }

          .item-text {
            flex: 1;
          }

          .iconfont {
            font-size: 52rpx;
            margin-left: 20rpx;

            &.icon-yue {
              color: #fdd650;
            }

            &.icon-tuiguangyongjin {
              color: #fe7742;
            }

            &.icon-fapiaobaoxiao {
              color: #fe862b;
            }

            &.icon-kefu {
              color: #40c393;
            }
          }
        }
      }
    }

    .menu-grid {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      row-gap: 30rpx;
      column-gap: 0;
      padding: 30rpx 0;

      .menu-item {
        width: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: background-color 0.2s ease-in-out;
        padding: 16rpx 0;
        box-sizing: border-box;

        &:active {
          background-color: #f5f5f5;
        }

        .menu-icon {
          font-size: 56rpx;
          margin-bottom: 12rpx;
          color: $color-success;
        }

        .menu-text {
          font-size: 26rpx;
          color: $color-text-primary;
          text-align: center;
        }
      }
    }
  }
}
</style>
