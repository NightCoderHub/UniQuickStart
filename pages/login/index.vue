<template>
  <action-confirmation-modal
    v-model:show="showProtocolPopup"
    cancel-text="暂不同意"
    confirm-text="同意并继续"
    @confirm="handlePrivacyAgree"
  >
    <template #modal-title>
      <text>阅读并同意以下协议</text>
    </template>
    <template #modal-description>
      为了保证您的个人信息安全，使用登录功能需要先阅读并同意

      <text class="highlight-link" @click="openPolicy('privacy')">《隐私政策》</text>
      和
      <text class="highlight-link" @click="openPolicy('agreement')">《用户协议》</text>
    </template>
  </action-confirmation-modal>
  <view class="login-page">
    <view class="header">
      <view class="title">账号密码登录</view>
      <view class="subtitle">请使用已注册的账号密码</view>
    </view>

    <view class="form">
      <view class="input-container">
        <view class="input-item">
          <text class="iconfont icon-shouji"></text>
          <input v-model="loginForm.phone" type="number" placeholder="请输入手机号" />
        </view>
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input v-model="loginForm.password" :password="!showPassword" placeholder="请输入6-12位密码" />
          <text
            :class="['iconfont', !showPassword ? 'icon-bukeshimima' : 'icon-keshimima']"
            @click="showPassword = !showPassword"
          ></text>
        </view>
      </view>
      <view class="options">
        <!-- <view class="remember">
          <wd-checkbox v-model="isRemember" size="large"></wd-checkbox>
          <text>记住密码</text>
        </view> -->
        <text class="forget" @click="uni.navigateTo({ url: '/pages/forgot-password/forgot-password' })">忘记密码?</text>
      </view>

      <view class="agreement">
        <wd-checkbox v-model="isAgree" size="large"></wd-checkbox>
        <text class="agree-text">
          同意
          <text class="highlight-link" @click="openPolicy('privacy')">《服务协议》</text>
          和
          <text class="highlight-link" @click="openPolicy('agreement')">《隐私政策》</text>
        </text>
      </view>

      <button class="login-btn" :loading="isLoggingIn" @click="handleLogin">登录</button>
      <view class="verify-login" @click="uni.navigateTo({ url: '/pages/register/register' })">还没有账号？去注册</view>
    </view>

    <!-- <view class="other-login">
      <view class="divider">
        <text>其他登录方式</text>
      </view>
      <view class="social-login">
        <view class="social-item">
          <uni-icons type="weixin" size="40" color="#07c160" />
        </view>
        <view class="social-item">
          <uni-icons type="qq" size="40" color="#165DFF" />
        </view>
        <view class="social-item">
          <uni-icons type="apple" size="40" />
        </view>
      </view>
    </view> -->
  </view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "@/stores";
import { login, getUserInfo } from "@/api";
const userStore = useUserStore();

const loginForm = reactive({
  phone: "",
  password: "",
});
const isLoggingIn = ref(false);

const isAgree = ref(false);
const showPassword = ref(false);

const showProtocolPopup = ref(false);

const openPolicy = (type) => {
  const urls = {
    privacy: "/settingPages/legal/privacy-policy",
    agreement: "/settingPages/legal/user-agreement",
  };
  uni.navigateTo({
    url: urls[type],
    fail: (err) => {
      console.error("跳转协议页面失败：", err);
      uni.showToast({
        title: "无法打开协议页面，请稍后再试",
        icon: "none",
      });
    },
  });
};

const handlePrivacyAgree = () => {
  uni.setStorageSync("privacy_policy_agreed", true);
  uni.setStorageSync("browsing_mode", false);
  isAgree.value = true;
};

const handleLogin = async () => {
  if (!loginForm.phone) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
  // 手机号正则校验（中国大陆手机号）
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(loginForm.phone)) {
    uni.showToast({ title: "请输入正确的手机号", icon: "none" });
    return;
  }
  if (!loginForm.password) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }
  if (!isAgree.value) {
    showProtocolPopup.value = true;
    return;
  }
  isLoggingIn.value = true;
  try {
    // 1. 登录接口，获得 token
    const loginRes = await login({
      account: loginForm.phone,
      password: loginForm.password,
    });
    const access_token = loginRes;
    // 保存 token 到 userStore（单独设置）
    userStore.setToken(access_token);
    // userStore.setRefreshToken(loginRes.refresh_token);

    // 2. 请求用户信息接口
    const userInfoRes = await getUserInfo();
    // 合并用户信息到 userStore
    userStore.setUserInfo({
      ...userInfoRes,
    });
    uni.showToast({ title: "登录成功", icon: "none" });
    // 3. 跳转首页
    uni.switchTab({ url: "/pages/index/index" });
  } catch (err) {
    uni.showToast({ title: err.message || "登录失败", icon: "none" });
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
}

.title {
  margin-top: 64rpx;
  margin-bottom: 20rpx;
  font-family: PingFangSC-Medium;
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

  /* color: #C8C9CC; */
}

.input-item .iconfont {
  font-size: 48rpx;
  color: #333;
}

.input-item input {
  flex: 1;
  font-size: 32rpx;
}

.options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 24rpx;
  margin-bottom: 48rpx;
}

/* .remember {
  display: flex;
  align-items: center;
}

.remember text {
  margin-left: 10rpx;
  font-size: 28rpx;
  color: #333;
} */

.forget {
  font-size: 28rpx;
  color: #165dff;
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 112rpx;
  margin-bottom: 20rpx;
}

.agree-text {
  margin-left: 10rpx;
  font-size: 28rpx;
  line-height: 1.4;
  color: #666;
}

.highlight-link {
  color: #165dff;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  margin-bottom: 48rpx;
  font-size: 16px;
  line-height: 88rpx;
  color: #fff;
  letter-spacing: 12rpx;
  background-color: $uni-color-primary;
  border-radius: 44rpx;
}

.verify-login {
  font-size: 28rpx;
  font-weight: normal;
  color: $uni-color-primary;
  text-align: center;
}

/*
.other-login {
  margin-top: auto;
  padding-bottom: 60rpx;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 60rpx;
}

.divider text {
  background-color: #fff;
  padding: 0 20rpx;
  color: #999;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #eee;
  z-index: 0;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 80rpx;
}

.social-item {
  display: flex;
  justify-content: center;
  align-items: center;
} */

.uni-input-placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

:deep(.wd-checkbox__shape) {
  background-color: #fff;
  border-width: 1px;
}
</style>
