<template>
  <view class="login-page">
    <view class="header">
      <image class="logo" src="/static/logo.jpg" mode="aspectFill"></image>
      <view class="title">欢迎登录</view>
      <!--     <view class="subtitle"></view>
      <view class="tips"></view> -->
    </view>

    <view class="content">
      <!-- #ifdef MP-WEIXIN -->
      <button
        v-if="isAgree"
        class="wx-login-btn"
        open-type="getPhoneNumber"
        :loading="isLoggingIn"
        :disabled="isLoggingIn"
        @getphonenumber="onGetPhoneNumber"
      >
        快捷授权登录
      </button>
      <button v-else class="wx-login-btn" @click="checkAgreement">快捷授权登录</button>
      <!-- #endif -->
      <button class="phone-login-btn" :disabled="isLoggingIn" @click="goToPhoneLogin">手机号登录</button>
      <view class="agreement agreement-bottom">
        <wd-checkbox v-model="isAgree" size="large" checked-color="#4c92fc" @change="onAgreementChange">
          <view class="agree-text">
            我已阅读并同意
            <text class="highlight-link" @click.stop="openPolicy('agreement')">《用户协议》</text>
            和
            <text class="highlight-link" @click.stop="openPolicy('privacy')">《隐私政策》</text>
          </view>
        </wd-checkbox>
      </view>
      <wd-action-sheet v-model="showPhoneSheet" title="手机号登录" :safe-area-inset-bottom="true">
        <view class="input-container">
          <view class="input-item">
            <text class="iconfont icon-shouji"></text>
            <input v-model="loginForm.phone" type="number" maxlength="11" placeholder="请输入手机号" confirm-type="done" />
          </view>
          <view class="input-item">
            <text class="iconfont icon-mima"></text>
            <input v-model="loginForm.password" :password="!sheetShowPassword" placeholder="请输入密码" confirm-type="done" />
            <text
              :class="['iconfont', sheetShowPassword ? 'icon-keshimima' : 'icon-bukeshimima', 'toggle']"
              @click="sheetShowPassword = !sheetShowPassword"
            ></text>
          </view>
        </view>
        <button class="wx-login-btn login-btn" :loading="isLoggingIn" :disabled="isLoggingIn" @click="handleLogin">登录</button>
        <view class="agreement sheet-agreement">
          <wd-checkbox v-model="isAgree" size="large" checked-color="#4c92fc" @change="onAgreementChange">
            <view class="agree-text">
              我已阅读并同意
              <text class="highlight-link" @click.stop="openPolicy('agreement')">《用户协议》</text>
              和
              <text class="highlight-link" @click.stop="openPolicy('privacy')">《隐私政策》</text>
            </view>
          </wd-checkbox>
        </view>
        <view class="sheet-register-link" @click="goToRegister">没有账号？立即注册</view>
      </wd-action-sheet>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores";
import { usePrivacyStore } from "@/stores/modules/privacy.js";
import { login, getUserInfo } from "@/api/user.js";
defineOptions({ name: "LoginPage" });

const userStore = useUserStore();
const privacyStore = usePrivacyStore();

const loginForm = reactive({
  phone: "",
  password: "",
});
const isLoggingIn = ref(false);

const isAgree = ref(uni.getStorageSync("privacy_policy_agreed") || false);

const fromUrl = ref("");
const showPhoneSheet = ref(false);
const sheetShowPassword = ref(false);

const parseTokenPayload = (payload) => {
  if (!payload) return { token: "", refreshToken: "" };
  if (typeof payload === "string") return { token: payload, refreshToken: "" };
  const token = payload.token || "";
  const refreshToken = payload.refresh_token || payload.refreshToken || "";
  return { token, refreshToken };
};

const navigateAfterLogin = (target) => {
  const url = typeof target === "string" ? target : "/pages/index/index";
  if (!url) {
    uni.switchTab({ url: "/pages/index/index" });
    return;
  }
  if (url.startsWith("/pages/index/index")) {
    uni.switchTab({ url });
  } else {
    uni.redirectTo({ url });
  }
};

onLoad(async (options) => {
  // 记录来源地址
  if (options?.from) {
    try {
      fromUrl.value = decodeURIComponent(options.from);
    } catch {
      fromUrl.value = options.from;
    }
  }
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    navigateAfterLogin(fromUrl.value || "/pages/index/index");
    return;
  }
  // 注意：小程序启动时已尝试 silentLogin (见 App.vue)。
  // 这里不再重复调用，除非需要处理特殊逻辑（如 session 恢复）。
  // 如果进入了登录页，通常意味着静默登录失败或未注册。
  // #endif
});

// 校验协议
const checkAgreement = () => {
  if (!isAgree.value) {
    uni.showToast({ title: "请先阅读并同意《用户协议》和《隐私政策》", icon: "none" });
    return false;
  }
  return true;
};

const onGetPhoneNumber = async (e) => {
  // 1. 校验微信返回状态
  const errMsg = e.detail.errMsg || "";
  if (errMsg.indexOf("ok") === -1) {
    return uni.showToast({ title: "已取消授权", icon: "none" });
  }

  // 2. 执行登录逻辑
  isLoggingIn.value = true;
  try {
    const result = await userStore.handlePhoneLogin(e.detail.code);
    if (result?.success) {
      uni.showToast({ title: "登录成功" });
      navigateAfterLogin(fromUrl.value || "/pages/index/index");
    }
  } catch {
    uni.showToast({ title: "登录失败，请重试", icon: "none" });
  } finally {
    isLoggingIn.value = false;
  }
};

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

const onAgreementChange = () => {
  const checked = !!isAgree.value;
  privacyStore.setAgreed(checked);
  privacyStore.setBrowsingMode(!checked);
};

const handleLogin = async () => {
  if (!loginForm.phone) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return;
  }
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
    uni.showToast({ title: "请先阅读并同意《用户协议》和《隐私政策》", icon: "none" });
    return;
  }
  isLoggingIn.value = true;
  try {
    privacyStore.ensureAgreedForLogin();
    const loginRes = await login({
      account: loginForm.phone,
      password: loginForm.password,
    });
    const { token: access_token, refreshToken } = parseTokenPayload(loginRes);
    userStore.setToken(access_token);
    if (refreshToken) userStore.setRefreshToken(refreshToken);
    const userInfoRes = await getUserInfo();
    userStore.setUserInfo({ ...userInfoRes });
    uni.showToast({ title: "登录成功", icon: "none" });
    navigateAfterLogin(fromUrl.value || "/pages/index/index");
  } catch (err) {
    uni.showToast({ title: err?.message || "登录失败", icon: "none" });
  } finally {
    isLoggingIn.value = false;
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: "/pages/register/register" });
};

const goToPhoneLogin = () => {
  showPhoneSheet.value = true;
};
</script>

<style lang="scss" scoped>
:deep(.wd-action-sheet) {
  background-color: #f7f8fa !important;
}

.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 0 40rpx;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140rpx;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 8%);
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 2rpx;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.tips {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #969799;
}

.content {
  width: 100%;
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.agreement-bottom {
  margin-top: 48rpx;
}

.agree-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: #999;
}

.highlight-link {
  display: inline;
  color: $uni-color-primary;
}

.wx-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 92rpx;
  margin-top: 8rpx;
  margin-bottom: 28rpx;
  color: #fff;
  background-color: $uni-color-primary;
  border: none;
  border-radius: 48rpx;

  // box-shadow: 0 8rpx 20rpx rgb(7 193 96 / 25%);
  transition: all 0.3s;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }

  text {
    margin-left: 12rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #fff;
  }
}

.phone-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 92rpx;
  margin-bottom: 12rpx;
  background-color: #eef2ff;
  border: none;
  border-radius: 48rpx;
  transition: all 0.3s;

  text {
    font-size: 32rpx;
    font-weight: 500;
    color: #3b5bfd;
  }

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.95;
    transform: scale(0.99);
  }
}

:deep(.wd-checkbox__shape) {
  margin-top: 2rpx;
}

.account-form {
  padding: 0 20rpx;
  margin-top: 32rpx;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background-color: #f7f8fa !important;
}

.input-item {
  display: flex;
  gap: 32rpx;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  margin: 0 24rpx;
  font-size: 26rpx;
  line-height: 100rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  border-radius: 200rpx;
}

.input-item input {
  flex: 1;
  font-size: 32rpx;
}

.input-item .iconfont {
  font-size: 48rpx;
  color: #333;
}

.input-item .toggle {
  font-size: 44rpx;
  color: #999;
}

.uni-input-placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

.sheet-agreement {
  padding-left: 24rpx;
  margin-top: 16rpx;
}

.login-btn {
  width: calc(100% - 48rpx);
  margin-top: 24rpx;
  letter-spacing: 12rpx;
}

.sheet-register-link {
  margin: 20rpx 0;
  font-size: 28rpx;
  color: $uni-color-primary;
  text-align: center;
}
</style>
