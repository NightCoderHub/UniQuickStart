<template>
  <view class="login-container">
    <view class="login-header">
      <text class="title">欢迎登录</text>
    </view>

    <view class="login-form">
      <wd-input
        v-model="loginForm.username"
        label="用户名"
        placeholder="请输入用户名"
        clearable
        size="large"
        custom-class="input-field"
      />
      <wd-input
        v-model="loginForm.password"
        label="密码"
        placeholder="请输入密码"
        type="password"
        clearable
        size="large"
        custom-class="input-field"
      />

      <wd-button
        type="primary"
        size="large"
        custom-class="login-button"
        :loading="isLoggingIn"
        :disabled="isLoggingIn"
        @click="handleLogin"
      >
        登录
      </wd-button>

      <view class="links">
        <text class="link-item" @click="goToRegister">注册账号</text>
        <text class="link-item" @click="goToForgotPassword">忘记密码？</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { login } from "@/api/auth"; // 引入 login 接口

const loginForm = reactive({
  username: "admin",
  password: "admin123",
});

const isLoggingIn = ref(false);

const handleLogin = async () => {
  if (!loginForm.username) {
    uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
    return;
  }
  if (!loginForm.password) {
    uni.showToast({
      title: "请输入密码",
      icon: "none",
    });
    return;
  }

  isLoggingIn.value = true; // 设置登录中状态

  try {
    // 调用后端登录接口
    const res = await login({
      username: loginForm.username,
      password: loginForm.password,
    });
    uni.setStorageSync("token", res.access_token);
    uni.setStorageSync("refreshToken", res.refresh_token);
    // uni.$emit("loginSuccess", { username: res.data.user.username });
    uni.switchTab({
      url: "/pages/index/index",
    });
  } finally {
    isLoggingIn.value = false; // 无论成功失败，都解除登录中状态
  }
};

const goToRegister = () => {
  uni.navigateTo({
    url: "/pages/register/register",
  });
};

const goToForgotPassword = () => {
  uni.navigateTo({
    url: "/pages/forgotPassword/forgotPassword",
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
  box-sizing: border-box;
}

.login-header {
  margin-bottom: 80rpx;
  text-align: center;

  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .input-field {
    margin-bottom: 30rpx;
  }

  .login-button {
    margin-top: 50rpx;
  }

  .links {
    display: flex;
    justify-content: space-between;
    margin-top: 40rpx;
    font-size: 28rpx;
    color: #007aff;
  }

  .link-item {
    padding: 10rpx 0;
    &:active {
      opacity: 0.7;
    }
  }
}
</style>
