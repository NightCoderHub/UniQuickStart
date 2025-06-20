<template>
  <view class="login-container">
    <wd-toast />
    <wd-message-box />

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
import { useToast, useMessage } from "wot-design-uni";

// 获取 toast 和 message 实例
const toast = useToast();
const message = useMessage();

const loginForm = reactive({
  username: "",
  password: "",
});

const isLoggingIn = ref(false);

const handleLogin = async () => {
  if (!loginForm.username) {
    toast.error("请输入用户名");
    return;
  }
  if (!loginForm.password) {
    toast.error("请输入密码");
    return;
  }

  isLoggingIn.value = true;

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 模拟登录成功与失败
    if (loginForm.username === "test" && loginForm.password === "123456") {
      uni.setStorageSync("simulatedUser", {
        username: loginForm.username,
        avatarUrl:
          "https://cdn-app.gitee.com/upload/20210202/202102021102401612234560759_thumbnail.jpeg",
      });

      message
        .alert({
          title: "登录成功",
          msg: "欢迎回来！",
          confirmButtonText: "确定",
        })
        .then(() => {
          // 登录成功后，通知其他页面（例如“我的”页面）更新状态
          uni.$emit("loginSuccess", { username: loginForm.username });

          // 根据实际情况选择跳转方式：
          // 如果首页是tabbar页面，使用switchTab。
          uni.switchTab({
            url: "/pages/index/index",
          });
          // 如果目标页面不是tabbar页面，且要清空所有历史记录并跳转，可以使用 uni.reLaunch
          // uni.reLaunch({
          //   url: '/pages/index/index'
          // });
        });
    } else {
      toast.error("用户名或密码错误");
    }
  } catch (error) {
    toast.error("登录失败，请稍后再试");
    console.error("登录请求失败:", error);
  } finally {
    isLoggingIn.value = false;
  }
};

// **修复点：将 uni.redirectTo 修改为 uni.navigateTo**
const goToRegister = () => {
  uni.navigateTo({
    url: "/pages/register/register",
  });
};

// **修复点：将 uni.redirectTo 修改为 uni.navigateTo**
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
