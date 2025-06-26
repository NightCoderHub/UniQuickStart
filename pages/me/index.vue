<template>
  <view class="profile-page">
    <custom-nav-bar></custom-nav-bar>
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="user-info">
        <image
          class="avatar"
          src="/static/default_avator.png"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <view class="user-name">张妈</view>
          <!--    <view class="service-tags">
            <wd-tag type="success" plain size="small">冰箱维修</wd-tag>
            <wd-tag type="warning" plain size="small">彩电维修</wd-tag>
          </view> -->
          <view class="rating-info">
            <text class="rating"
              >星级评分 <text style="font-weight: bold">5.0</text></text
            >
            <text class="divider">|</text>
            <text class="completion"
              >完单率 <text style="font-weight: bold">优秀</text></text
            >
          </view>
        </view>
      </view>
      <view class="settings-icon">
        <text class="iconfont icon-setting1"></text>
      </view>
    </view>

    <!-- 功能菜单区域 -->
    <view class="menu-section">
      <!-- 第一行菜单 -->
      <view class="menu-card">
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
          <image
            class="divide-vertical-line top"
            src="/static/divide-vertical-line.svg"
            mode="heightFix"
          ></image>
          <image
            class="divide-vertical-line bottom"
            src="/static/divide-vertical-line.svg"
            mode="heightFix"
          ></image>
          <image
            class="divide-horizontal-line left"
            src="/static/divide-horizontal-line.webp"
            mode="widthFix"
          ></image>
          <image
            class="divide-horizontal-line right"
            src="/static/divide-horizontal-line.webp"
            mode="widthFix"
          ></image>
        </view>
      </view>

      <!-- 第二行菜单 -->
      <view class="menu-card">
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

      <!-- 第三行菜单 -->
      <view class="menu-card">
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
          <view class="menu-item" @click="handleMenuClick('master')">
            <text class="iconfont icon-shifuduan menu-icon"></text>
            <text class="menu-text">师傅端</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    handleMenuClick(type) {
      console.log("点击菜单:", type);
      // 处理菜单点击事件
      switch (type) {
        case "balance":
          uni.navigateTo({ url: "/pages/balance/balance" });
          break;
        case "orders":
          uni.navigateTo({ url: "/pages/orders/orders" });
          break;
        case "commission":
          uni.navigateTo({ url: "/pages/commission/commission" });
          break;
        case "service":
          uni.navigateTo({ url: "/pages/service/service" });
          break;
        // 其他菜单项处理...
        default:
          uni.showToast({
            title: `点击了${type}`,
            icon: "none",
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  // background: linear-gradient(180deg, #a8e6cf 0%, #88d8a3 100%);
  background: linear-gradient(0deg, #f2f3f8 0%, rgba(64, 195, 147, 0.5) 100%);
}

.user-section {
  display: flex;
  align-items: center;
  padding: 40rpx;

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
    }

    .user-details {
      .user-name {
        font-size: 48rpx;
        font-weight: 600;
        color: $color-gray-800;
        margin-bottom: 10rpx;
      }

      .service-tags {
        display: flex;
        gap: 20rpx;
        margin-bottom: 15rpx;
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
    }
  }

  .settings-icon {
    .iconfont {
      font-size: 44rpx;
      color: #333333;
    }
  }
}

.menu-section {
  // padding: 0 24rpx;
  .dashboard-grid {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    gap: 40rpx;
    padding: 12rpx;
    .service-item {
      width: 40%;
      height: 80rpx;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 28rpx;
      color: $color-text-heading;
      font-weight: 600;
      .iconfont {
        font-size: 48rpx;

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
    .divide-vertical-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
      height: 100rpx;
      &.top {
        top: -10rpx;
      }
      &.bottom {
        bottom: -10rpx;
      }
    }
    .divide-horizontal-line {
      position: absolute;
      top: 50%;
      transform: translateY(50%);
      z-index: 1;
      width: 250rpx;
      opacity: 0.3;
      &.left {
        left: 0;
      }
      &.right {
        right: 0;
      }
    }
  }
  .menu-card {
    border-radius: 16rpx;
    background: #ffffff;
    margin-left: 24rpx;
    margin-right: 30rpx;
    margin-bottom: 30rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

    .menu-grid {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      row-gap: 24rpx;
      column-gap: 30rpx;
      padding: 26rpx 38rpx;
      .menu-item {
        width: calc((100% - 90rpx) / 4);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: background-color 0.3s;
        padding: 16rpx 0;
        &:active {
          background-color: #f5f5f5;
        }

        .menu-icon {
          font-size: 50rpx;
          margin-bottom: 12rpx;
          color: $color-success;
        }

        .menu-text {
          font-size: 24rpx;
          color: $color-text-primary;
        }
      }
    }
  }
}
</style>
