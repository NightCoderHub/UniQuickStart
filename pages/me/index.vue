<template>
  <view class="me-container">
    <wd-toast />
    <wd-message-box />
    <view class="user-info">
      <wd-img
        width="120rpx"
        height="120rpx"
        round
        :src="userInfo.avatarUrl"
        custom-class="avatar"
      />
      <view class="username">{{ userInfo.username || "点击登录" }}</view>
      <view v-if="userInfo.username" class="welcome-text"
        >欢迎回来，{{ userInfo.username }}！</view
      >
      <wd-button
        v-if="!userInfo.username"
        type="primary"
        size="small"
        round
        custom-class="login-btn"
        @click="goToLogin"
      >
        立即登录
      </wd-button>
    </view>

    <view class="function-list">
      <wd-cell-group title="常用功能">
        <wd-cell
          title="我的订单"
          icon="order"
          is-link
          @click="handleGoToPage('myOrders')"
        />
        <wd-cell
          title="我的收藏"
          icon="star"
          is-link
          @click="handleGoToPage('myFavorites')"
        />
        <wd-cell
          title="收货地址"
          icon="location"
          is-link
          @click="handleGoToPage('addressManagement')"
        />
        <wd-cell
          title="优惠券"
          icon="coupon"
          is-link
          @click="handleGoToPage('myCoupons')"
        />
      </wd-cell-group>

      <wd-cell-group title="设置与帮助" custom-class="mt30">
        <wd-cell
          title="帮助与反馈"
          icon="question"
          is-link
          @click="handleGoToPage('helpFeedback')"
        />
        <wd-cell
          title="关于我们"
          icon="info"
          is-link
          @click="handleGoToPage('aboutUs')"
        />
        <wd-cell
          title="隐私政策"
          icon="lock"
          is-link
          @click="handleGoToPage('privacyPolicy')"
        />
      </wd-cell-group>
    </view>

    <wd-button
      v-if="userInfo.username"
      type="danger"
      size="large"
      custom-class="logout-button"
      @click="handleLogout"
    >
      退出登录
    </wd-button>
  </view>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from "vue";
import { useToast, useMessage } from "wot-design-uni";

// 获取 toast 和 message 实例
// 现在我们明确知道它们返回的是实例，我们来命名它们，而不是直接解构函数
const toast = useToast();
const message = useMessage();

const userInfo = reactive({
  username: "",
  avatarUrl:
    "https://cdn-app.gitee.com/upload/20210202/202102021102401612234560759_thumbnail.jpeg",
});

const checkLoginStatus = () => {
  const simulatedUser = uni.getStorageSync("simulatedUser");
  if (simulatedUser) {
    userInfo.username = simulatedUser.username;
    userInfo.avatarUrl = simulatedUser.avatarUrl;
  } else {
    userInfo.username = "";
    userInfo.avatarUrl =
      "https://cdn-app.gitee.com/upload/20210202/202102021102401612234560759_thumbnail.jpeg";
  }
};

const goToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/index",
  });
};

const handleGoToPage = (pageName) => {
  // 调用 toast 实例上的 show 方法
  toast.show({ msg: `您点击了 ${pageName}`, type: "info" });
};

const handleLogout = () => {
  // 调用 message 实例上的 confirm 方法
  message
    .confirm({
      title: "提示",
      msg: "确定要退出登录吗？",
      showCancelButton: true,
    })
    .then(() => {
      uni.removeStorageSync("simulatedUser");
      userInfo.username = "";
      userInfo.avatarUrl =
        "https://cdn-app.gitee.com/upload/20210202/202102021102401612234560759_thumbnail.jpeg";
      toast.success("已退出登录"); // 调用 toast 实例上的 success 方法
    })
    .catch(() => {
      // 用户取消
    });
};

onMounted(() => {
  checkLoginStatus();
  uni.$on("loginSuccess", (data) => {
    console.log("Login successful, received data:", data);
    checkLoginStatus();
  });
});

onUnmounted(() => {
  uni.$off("loginSuccess");
});
</script>

<style lang="scss" scoped>
.me-container {
  min-height: 100vh;
  background-color: #f7f7f7;
  padding-bottom: 40rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

  .avatar {
    margin-bottom: 20rpx;
    border: 4rpx solid #eee;
  }

  .username {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .welcome-text {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
  }

  .login-btn {
    width: 200rpx;
  }
}

.function-list {
  padding: 0 20rpx;
  margin-bottom: 40rpx;

  .wd-cell-group {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
  }

  .mt30 {
    margin-top: 30rpx;
  }
}

.logout-button {
  margin: 0 40rpx;
  margin-top: 40rpx;
}
</style>
