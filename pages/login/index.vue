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

      <text class="highlight-link" @click="openPolicy('privacy')"
        >《隐私政策》</text
      >
      和
      <text class="highlight-link" @click="openPolicy('agreement')"
        >《用户协议》</text
      >
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
          <input
            v-model="loginForm.phone"
            type="number"
            placeholder="请输入手机号"
          />
        </view>
        <view class="input-item">
          <text class="iconfont icon-mima"></text>
          <input
            v-model="loginForm.password"
            :password="!showPassword"
            placeholder="请输入6-12位密码"
          />
          <text
            :class="[
              'iconfont',
              !showPassword ? 'icon-bukeshimima' : 'icon-keshimima',
            ]"
            @click="showPassword = !showPassword"
          ></text>
        </view>
      </view>
      <view class="options">
        <!-- <view class="remember">
          <wd-checkbox v-model="isRemember" size="large"></wd-checkbox>
          <text>记住密码</text>
        </view> -->
        <text
          class="forget"
          @click="
            uni.navigateTo({ url: '/pages/forgot-password/forgot-password' })
          "
          >忘记密码?</text
        >
      </view>

      <view class="agreement">
        <wd-checkbox v-model="isAgree" size="large"></wd-checkbox>
        <text class="agree-text">
          同意
          <text class="highlight-link" @click="openPolicy('privacy')"
            >《隐私政策》</text
          >
          和
          <text class="highlight-link" @click="openPolicy('agreement')"
            >《服务协议》</text
          >
        </text>
      </view>

      <button class="login-btn" :loading="isLoggingIn" @click="handleLogin">
        登录
      </button>
      <view
        class="verify-login"
        @click="uni.navigateTo({ url: '/pages/register/register' })"
        >还没有账号？去注册</view
      >
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
const userStore = useUserStore();

const loginForm = reactive({
  phone: "13800000000",
  password: "123456",
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
    // 1. 登录接口，获得 token 和 refreshToken（mock 示例，实际请替换为真实 API）
    const loginRes = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          loginForm.phone === "13800000000" &&
          loginForm.password === "123456"
        ) {
          resolve({
            access_token: "mock_access_token_12345",
            refresh_token: "mock_refresh_token_abcde",
          });
        } else {
          reject(new Error("手机号或密码错误"));
        }
      }, 1000);
    });
    // 保存 token 到 userStore（单独设置）
    userStore.setToken(loginRes.access_token);
    userStore.setRefreshToken(loginRes.refresh_token);

    // 2. 请求用户信息接口（mock 示例，实际请替换为真实 API）
    const userInfoRes = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          nickname: "测试用户",
          userId: "12345678",
          gender: 1,
          birthday: "1990-01-01",
          phone: "13800000000",
          email: "test@example.com",
          rating: "4.8",
          completion: "95%",
          avatar: "/static/default_avator.png",
        });
      }, 500);
    });
    // 合并用户信息到 userStore
    userStore.setUserInfo({
      ...userInfoRes,
    });

    uni.showToast({ title: "登录成功", icon: "success" });
    // 3. 跳转首页
    uni.switchTab({ url: "/pages/index/index" });
  } catch (err) {
    uni.showToast({ title: err.message || "登录失败", icon: "none" });
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<style scoped>
.login-page {
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

.options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 24rpx;
  margin-bottom: 48rpx;
}

.forget {
  color: #165dff;
  font-size: 28rpx;
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
  color: #666;
  line-height: 1.4;
}

.highlight-link {
  color: #165dff;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #57c051;
  color: #fff;
  font-size: 16px;
  border-radius: 44rpx;
  margin-bottom: 48rpx;
  letter-spacing: 12rpx;
}

.login-btn[disabled] {
  background-color: #57c051;
  color: #fff;

  opacity: 0.5;
}

.verify-login {
  font-size: 28rpx;
  font-weight: normal;
  text-align: center;
  color: #57c051;
}

.uni-input-placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

:deep(.wd-checkbox__shape) {
  background-color: #fff;
  border-width: 1px;
}
</style>
