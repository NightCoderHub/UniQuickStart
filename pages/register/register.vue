<template>
  <view class="register-container">
    <wd-toast />
    <wd-message-box />
    <view class="register-header">
      <text class="title">注册账号</text>
    </view>

    <view class="register-form">
      <wd-input
        v-model="registerForm.username"
        label="用户名"
        placeholder="请输入用户名"
        clearable
        size="large"
        custom-class="input-field"
      />
      <wd-input
        v-model="registerForm.password"
        label="密码"
        placeholder="请输入密码"
        type="password"
        clearable
        size="large"
        custom-class="input-field"
      />
      <wd-input
        v-model="registerForm.confirmPassword"
        label="确认密码"
        placeholder="请再次输入密码"
        type="password"
        clearable
        size="large"
        custom-class="input-field"
      />

      <wd-button
        type="primary"
        size="large"
        custom-class="register-button"
        :loading="isRegistering"
        :disabled="isRegistering"
        @click="handleRegister"
      >
        注册
      </wd-button>

      <view class="links">
        <text class="link-item" @click="goToLogin">已有账号？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useToast, useMessage } from "wot-design-uni";

const toast = useToast();
const message = useMessage();

const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});

const isRegistering = ref(false);

const handleRegister = async () => {
  if (!registerForm.username) {
    toast.error("请输入用户名");
    return;
  }
  if (registerForm.password.length < 6) {
    toast.error("密码长度不能少于6位");
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    toast.error("两次输入的密码不一致");
    return;
  }

  isRegistering.value = true;

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 模拟注册成功逻辑
    message
      .alert({
        title: "注册成功",
        msg: "恭喜您，账号注册成功！",
        confirmButtonText: "立即登录",
      })
      .then(() => {
        // 注册成功后跳转到登录页
        uni.redirectTo({
          url: "/pages/login/index",
        });
      });
  } catch (error) {
    toast.error("注册失败，请稍后再试");
    console.error("注册请求失败:", error);
  } finally {
    isRegistering.value = false;
  }
};

const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
  box-sizing: border-box;
}

.register-header {
  margin-bottom: 80rpx;
  text-align: center;

  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
}

.register-form {
  width: 100%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .input-field {
    margin-bottom: 30rpx;
  }

  .register-button {
    margin-top: 50rpx;
  }

  .links {
    display: flex;
    justify-content: center; // 居中显示
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
