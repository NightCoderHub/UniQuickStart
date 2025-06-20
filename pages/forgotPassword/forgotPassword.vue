<template>
  <view class="forgot-password-container">
    <wd-toast />
    <wd-message-box />
    <view class="forgot-password-header">
      <text class="title">忘记密码</text>
    </view>

    <view class="forgot-password-form">
      <wd-input
        v-model="forgotForm.usernameOrEmail"
        label="用户名/邮箱"
        placeholder="请输入用户名或注册邮箱"
        clearable
        size="large"
        custom-class="input-field"
      />
      <wd-input
        v-model="forgotForm.newPassword"
        label="新密码"
        placeholder="请输入新密码"
        type="password"
        clearable
        size="large"
        custom-class="input-field"
      />
      <wd-input
        v-model="forgotForm.confirmNewPassword"
        label="确认新密码"
        placeholder="请再次输入新密码"
        type="password"
        clearable
        size="large"
        custom-class="input-field"
      />

      <wd-button
        type="primary"
        size="large"
        custom-class="submit-button"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        重置密码
      </wd-button>

      <view class="links">
        <text class="link-item" @click="goToLogin">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useToast, useMessage } from "wot-design-uni";

const toast = useToast();
const message = useMessage();

const forgotForm = reactive({
  usernameOrEmail: "",
  newPassword: "",
  confirmNewPassword: "",
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!forgotForm.usernameOrEmail) {
    toast.error("请输入用户名或注册邮箱");
    return;
  }
  if (forgotForm.newPassword.length < 6) {
    toast.error("新密码长度不能少于6位");
    return;
  }
  if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
    toast.error("两次输入的新密码不一致");
    return;
  }

  isSubmitting.value = true;

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 模拟密码重置成功逻辑
    message
      .alert({
        title: "重置成功",
        msg: "密码已成功重置，请使用新密码登录！",
        confirmButtonText: "前往登录",
      })
      .then(() => {
        uni.redirectTo({
          url: "/pages/login/index",
        });
      });
  } catch (error) {
    toast.error("密码重置失败，请稍后再试");
    console.error("密码重置请求失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.forgot-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
  box-sizing: border-box;
}

.forgot-password-header {
  margin-bottom: 80rpx;
  text-align: center;

  .title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333;
  }
}

.forgot-password-form {
  width: 100%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .input-field {
    margin-bottom: 30rpx;
  }

  .submit-button {
    margin-top: 50rpx;
  }

  .links {
    display: flex;
    justify-content: center;
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
