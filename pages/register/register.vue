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
        <!-- 城市选择 (已注释)
        <wd-picker
          label="城市"
          v-model="registerForm.cityId"
          :columns="cityColumns"
          @confirm="handleCityConfirm"
        />
        -->
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
import { reactive, ref, onUnmounted, onMounted } from "vue";
import { register } from "@/api";
import { sendSmsCode } from "@/api/user";
// import { listCities } from "@/api/service";

const registerForm = reactive({
  phone: "",
  verificationCode: "", // 添加验证码字段
  password: "",
  confirmPassword: "",
  cityId: "", // 添加城市ID字段
  cityName: "", // 添加城市名称字段
});

// 城市选择相关状态 (已注释)
// const cityList = ref([]);
// const cityColumns = ref([]);

const isRegistering = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 验证码相关状态
const countdown = ref(0);
const isCountingDown = ref(false);
let countdownTimer = null;

// 获取验证码方法
const getVerificationCode = async () => {
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

  // 防止重复点击
  if (isCountingDown.value) {
    return;
  }

  try {
    // 调用真实的发送验证码接口
    await sendSmsCode(registerForm.phone);

    // 发送成功，开始倒计时
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
  } catch (error) {
    console.error("发送验证码失败:", error);
    uni.showToast({
      title: "验证码发送失败，请稍后再试",
      icon: "none",
    });
  }
};

// 获取微信登录凭证
const getWxLoginCode = () => {
  // 返回Promise以便异步处理
  return new Promise((resolve, reject) => {
    // 仅在微信小程序环境下执行
    // #ifdef MP-WEIXIN
    uni.login({
      provider: "weixin",
      onlyAuthorize: true, // 设置为true，只请求授权认证，直接返回code
      success: function (loginRes) {
        if (loginRes.code) {
          console.log("获取微信code成功:", loginRes.code);
          resolve(loginRes.code);
        } else {
          console.error("获取微信code失败:", loginRes.errMsg);
          reject(new Error(loginRes.errMsg || "获取微信code失败"));
        }
      },
      fail: function (err) {
        console.error("微信登录失败:", err);
        reject(err);
      },
    });
    // #endif

    // 非微信小程序环境
    // #ifndef MP-WEIXIN
    resolve(""); // 非微信环境返回空字符串
    // #endif
  });
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

  // 城市ID验证已注释
  /*
  if (!registerForm.cityId) {
    uni.showToast({
      title: "请选择城市",
      icon: "none",
    });
    return;
  }
  */
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
    // 获取微信登录凭证
    let wxCode = "";
    try {
      wxCode = await getWxLoginCode();
    } catch (wxError) {
      console.error("获取微信code失败，继续注册流程:", wxError);
      // 获取失败不阻止注册流程继续
    }

    const params = {
      mobile: registerForm.phone,
      code: registerForm.verificationCode,
      password: registerForm.password,
      wxCode: wxCode, // 添加微信code参数
      cityId: 1, // 城市ID写死为1
    };
    await register(params);
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

// 获取城市列表 (已注释)
/*
const fetchCityList = async () => {
  try {
    const res = await listCities();
    if (res && Array.isArray(res)) {
      cityList.value = res;
      // 转换为wd-picker需要的格式
      cityColumns.value = res.map(city => ({
        label: city.name,
        value: city.id
      }));
    } else {
      console.error("获取城市列表失败，返回数据格式不正确");
    }
  } catch (error) {
    console.error("获取城市列表失败:", error);
    uni.showToast({
      title: "获取城市列表失败",
      icon: "none"
    });
  }
};

// 处理城市选择确认
const handleCityConfirm = (event) => {
  const selectedCity = cityList.value.find(city => city.id === event.value);
  if (selectedCity) {
    registerForm.cityName = selectedCity.name;
  }
};
*/

// 页面加载时获取城市列表
onMounted(() => {
  // fetchCityList();
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
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
  background-color: $uni-color-primary;
  border-radius: 44rpx;
}

.login-btn[disabled] {
  color: #fff;
  background-color: $uni-color-primary;
  opacity: 0.5;
}

.verify-login {
  font-size: 28rpx;
  font-weight: normal;
  color: $uni-color-primary;
  text-align: center;
}

.uni-input-placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

.code-input-item {
  position: relative;
}

.city-selector {
  flex: 1;
  font-size: 32rpx;
}

.placeholder {
  font-size: 26rpx;
  color: #c8c9cc;
}

.city-popup {
  max-height: 70vh;
  padding-bottom: 30rpx;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.city-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  font-size: 32rpx;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 28rpx;
  color: $uni-color-primary;
}

.city-list {
  max-height: 60vh;
}

.city-item {
  padding: 30rpx;
  font-size: 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.empty-tip {
  padding: 60rpx 0;
  font-size: 28rpx;
  color: #969799;
  text-align: center;
}

.get-code-button {
  position: absolute;
  top: 50%;
  right: 32rpx;
  z-index: 20;
  height: auto;
  padding: 0;
  font-size: 28rpx;
  line-height: normal;
  color: $uni-color-primary;
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
