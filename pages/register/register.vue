<template>
  <view class="login-page">
    <view class="header">
      <view class="title">注册账号</view>
      <view class="subtitle">请填写您的注册信息</view>
    </view>

    <view class="form">
      <view class="input-container">
        <view class="input-item">
          <text class="iconfont icon-shouji"></text>
          <input v-model="registerForm.phone" type="number" placeholder="请输入手机号" />
        </view>
        <!-- 添加验证码输入框 -->
        <view class="input-item code-input-item">
          <text class="iconfont icon-yanzhengma"></text>
          <input v-model="registerForm.verificationCode" type="number" placeholder="请输入6位数的验证码" maxlength="6" />
          <button class="get-code-button" :disabled="isCountingDown" @click="getVerificationCode">
            {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
          </button>
        </view>
        <!-- 验证码输入框结束 -->
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input v-model="registerForm.password" :password="!showPassword" placeholder="请输入6-12位密码" />
          <text
            :class="['iconfont', !showPassword ? 'icon-bukeshimima' : 'icon-keshimima']"
            @click="showPassword = !showPassword"
          ></text>
        </view>
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input v-model="registerForm.confirmPassword" :password="!showConfirmPassword" placeholder="请再次输入密码" />
          <text
            :class="['iconfont', !showConfirmPassword ? 'icon-bukeshimima' : 'icon-keshimima']"
            @click="showConfirmPassword = !showConfirmPassword"
          ></text>
        </view>
      </view>

      <button class="login-btn" :loading="isRegistering" @click="handleRegister">注册</button>

      <view class="verify-login" @click="goToLogin">已有账号？立即登录</view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onUnmounted } from "vue";

const registerForm = reactive({
  phone: "",
  verificationCode: "", // 添加验证码字段
  password: "",
  confirmPassword: "",
});

const isRegistering = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 验证码相关状态
const countdown = ref(0);
const isCountingDown = ref(false);
let countdownTimer = null;

// 获取验证码方法
const getVerificationCode = () => {
  if (!registerForm.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(registerForm.phone)) {
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

const handleRegister = async () => {
  if (!registerForm.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(registerForm.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }
  // 验证码校验
  if (!registerForm.verificationCode) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }
  if (registerForm.verificationCode.length !== 6) {
    uni.showToast({
      title: "验证码长度不正确",
      icon: "none",
    });
    return;
  }

  if (!registerForm.password) {
    uni.showToast({
      title: "请输入密码",
      icon: "none",
    });
    return;
  }
  if (registerForm.password.length < 6) {
    uni.showToast({
      title: "密码长度不能少于6位",
      icon: "none",
    });
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({
      title: "两次输入的密码不一致",
      icon: "none",
    });
    return;
  }

  isRegistering.value = true;

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 模拟注册成功逻辑
    uni.showModal({
      title: "注册成功",
      content: "恭喜您，账号注册成功！",
      showCancel: false,
      confirmText: "立即登录",
      success: (res) => {
        if (res.confirm) {
          // 注册成功后跳转到登录页
          uni.redirectTo({
            url: "/pages/login/index",
          });
        }
      },
    });
  } catch (error) {
    uni.showToast({
      title: "注册失败，请稍后再试",
      icon: "none",
    });
    console.error("注册请求失败:", error);
  } finally {
    isRegistering.value = false;
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

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
}

.title {
  margin-top: 64rpx;
  margin-bottom: 20rpx;
  font-size: 64rpx;
  color: #000;
  text-align: center;
}

.subtitle {
  font-size: 26rpx;
  color: #969799;
  text-align: center;
}

.form {
  padding: 0 32rpx;
  margin-top: 60rpx;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.input-item {
  display: flex;
  gap: 32rpx;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  font-size: 26rpx;
  line-height: 100rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  border-radius: 200rpx;
}

.input-item .iconfont {
  font-size: 48rpx;
  color: #333;
}

.input-item input {
  flex: 1;
  font-size: 32rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 48rpx;
  margin-bottom: 48rpx;
  font-size: 16px;
  line-height: 88rpx;
  color: #fff;
  letter-spacing: 12rpx;
  background-color: #57c051;
  border-radius: 44rpx;
}

.login-btn[disabled] {
  color: #fff;
  background-color: #57c051;
  opacity: 0.5;
}

.verify-login {
  font-size: 28rpx;
  font-weight: normal;
  color: #57c051;
  text-align: center;
}

.uni-input-placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

.code-input-item {
  position: relative;
}

.get-code-button {
  position: absolute;
  top: 50%;
  right: 32rpx;
  height: auto;
  padding: 0;
  font-size: 28rpx;
  line-height: normal;
  color: #57c051;
  background-color: transparent;
  border: none;
  transform: translateY(-50%);

  &::after {
    border: none;
  }

  &[disabled] {
    color: #969799;
    background-color: transparent;
  }
}
</style>
