<template>
  <view class="forgot-password-container">
    <view class="header">
      <view class="title">忘记密码</view>
      <view class="subtitle">请重置您的密码</view>
    </view>

    <view class="form">
      <view class="input-container">
        <view class="input-item">
          <text class="iconfont icon-shouji"></text>
          <input
            v-model="forgotForm.phone"
            type="number"
            placeholder="请输入手机号"
          />
        </view>
        <!-- 验证码输入框 -->
        <view class="input-item code-input-item">
          <text class="iconfont icon-yanzhengma"></text>
          <input
            v-model="forgotForm.verificationCode"
            type="number"
            placeholder="请输入6位数的验证码"
            maxlength="6"
          />
          <button
            class="get-code-button"
            :disabled="isCountingDown"
            @click="getVerificationCode"
          >
            {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
          </button>
        </view>
        <!-- 验证码输入框结束 -->
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input
            v-model="forgotForm.newPassword"
            :password="!showNewPassword"
            placeholder="请输入新密码 (6-12位)"
          />
          <text
            :class="[
              'iconfont',
              !showNewPassword ? 'icon-bukeshimima' : 'icon-keshimima',
            ]"
            @click="showNewPassword = !showNewPassword"
          ></text>
        </view>
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input
            v-model="forgotForm.confirmNewPassword"
            :password="!showConfirmNewPassword"
            placeholder="请再次输入新密码"
          />
          <text
            :class="[
              'iconfont',
              !showConfirmNewPassword ? 'icon-bukeshimima' : 'icon-keshimima',
            ]"
            @click="showConfirmNewPassword = !showConfirmNewPassword"
          ></text>
        </view>
      </view>

      <button
        type="primary"
        size="large"
        block
        class="submit-button"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        重置密码
      </button>

      <view class="links">
        <text class="link-item" @click="goToLogin">返回登录</text>
      </view>
    </view>
  </view>
  <wd-message-box></wd-message-box>
</template>

<script setup>
import { reactive, ref, onUnmounted } from "vue";
import { useMessage } from "wot-design-uni";

const message = useMessage();

const forgotForm = reactive({
  phone: "",
  verificationCode: "", // 添加验证码字段
  newPassword: "",
  confirmNewPassword: "",
});

const isSubmitting = ref(false);
const showNewPassword = ref(false);
const showConfirmNewPassword = ref(false);

// 验证码相关状态
const countdown = ref(0);
const isCountingDown = ref(false);
let countdownTimer = null;

// 获取验证码方法
const getVerificationCode = () => {
  if (!forgotForm.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(forgotForm.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  // 模拟发送验证码请求
  isCountingDown.value = true;
  countdown.value = 60; // 倒计时60秒
  uni.showToast({
    title: "验证码已发送",
    icon: "success",
  });

  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownTimer);
      isCountingDown.value = false;
    }
  }, 1000);
};

const handleSubmit = async () => {
  if (!forgotForm.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(forgotForm.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }
  // 验证码校验
  if (!forgotForm.verificationCode) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }
  if (forgotForm.verificationCode.length !== 6) {
    uni.showToast({
      title: "验证码长度不正确",
      icon: "none",
    });
    return;
  }

  if (forgotForm.newPassword.length < 6) {
    uni.showToast({
      title: "新密码长度不能少于6位",
      icon: "none",
    });
    return;
  }
  if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
    uni.showToast({
      title: "两次输入的新密码不一致",
      icon: "none",
    });
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
    uni.showToast({
      title: "密码重置失败，请稍后再试",
      icon: "none",
    });
    console.error("密码重置请求失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  uni.navigateBack();
};

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
.forgot-password-container {
  display: flex;
  flex-direction: column;
}
.title {
  font-family: PingFangSC-Medium;
  font-size: 64rpx;
  margin-top: 64rpx;
  margin-bottom: 20rpx;
  text-align: center;
  color: #000000;
}

.subtitle {
  font-size: 26rpx;
  color: #969799;
  text-align: center;
}

.form {
  margin-top: 60rpx;
  padding: 0 32rpx;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.input-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  line-height: 100rpx;
  border-bottom: 1px solid #eee;
  padding: 0 32rpx;
  background-color: #fff;
  border-radius: 200rpx;
  gap: 32rpx;
  font-size: 26rpx;
}

.input-item .iconfont {
  font-size: 48rpx;
  color: #333;
}

.input-item input {
  flex: 1;
  font-size: 32rpx;
}

.submit-button {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #57c051;
  color: #fff;
  font-size: 16px;
  border-radius: 44rpx;
  margin-top: 48rpx;
  letter-spacing: 12rpx;
}

.submit-button[disabled] {
  background-color: #57c051;
  color: #fff;
  opacity: 0.5;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #165dff;
}

.link-item {
  padding: 10rpx 0;
  color: #57c051;
  &:active {
    opacity: 0.7;
  }
}

:deep(.uni-input-placeholder) {
  font-size: 26rpx;
  color: #c8c9cc;
}

.code-input-item {
  position: relative;
}

.get-code-button {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  color: #57c051;
  font-size: 28rpx;
  padding: 0;
  height: auto;
  line-height: normal;

  &::after {
    border: none;
  }

  &[disabled] {
    color: #969799;
    background-color: transparent;
  }
}
</style>
