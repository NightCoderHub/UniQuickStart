<template>
  <view class="settings-page">
    <scroll-view scroll-y class="settings-scroll-view">
      <view class="setting-group">
        <view v-if="userStore.isLoggedIn" class="setting-item" @click="navigateTo('/settingPages/account/profile')">
          <text class="item-text">个人资料</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <!-- <view
          class="setting-item"
          @click="navigateTo('/settingPages/account/security')"
        >
          <text class="item-text">账号与安全</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view> -->
        <!-- <view
          class="setting-item"
          @click="navigateTo('/settingPages/account/privacy')"
        >
          <text class="item-text">隐私设置</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view> -->
        <!-- 新增系统权限设置入口 -->
        <view class="setting-item" @click="navigateTo('/settingPages/system-permissions/system-permissions')">
          <text class="item-text">系统权限设置</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>

      <view class="setting-group">
        <view class="setting-item" @click="clearCache">
          <text class="item-text">清除缓存</text>
          <text class="item-value">{{ cacheSize }}</text>
          <!-- 使用响应式变量 -->
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="setting-item" @click="checkUpdate">
          <text class="item-text">检查更新</text>
          <text class="item-value">当前版本 {{ APP_CONFIG.version }}</text>
          <!-- 使用响应式变量 -->
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>

      <view class="setting-group">
        <view class="setting-item" @click="navigateTo('/settingPages/legal/privacy-policy')">
          <text class="item-text">隐私政策</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="setting-item" @click="navigateTo('/settingPages/legal/user-agreement')">
          <text class="item-text">用户协议</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="setting-item" @click="navigateTo('/settingPages/help-feedback/help-center')">
          <text class="item-text">帮助中心</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="setting-item" @click="navigateTo('/settingPages/about/about')">
          <text class="item-text">关于我们</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>
      <view v-if="userStore.isLoggedIn" class="setting-group">
        <view class="setting-item" @click="showLogoutNotice">
          <text class="item-text">账户注销</text>
          <text class="item-value">注销后无法恢复</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>

      <view v-if="userStore.isLoggedIn" class="logout-section">
        <button class="logout-button" @click="logout">退出登录</button>
      </view>
    </scroll-view>

    <wd-popup v-model="showNoticePopup" position="bottom" custom-style="border-radius: 16rpx 16rpx 0 0">
      <view class="logout-notice-popup">
        <view class="popup-title">
          注销账号须知
          <view class="popup-close">
            <wd-icon name="close" size="16" color="#000000a6" @click="showNoticePopup = false"></wd-icon>
          </view>
        </view>
        <view scroll-y class="popup-content">
          <view class="notice-item">
            <text class="notice-number">1.</text>
            <text class="notice-text"
              >当您提交注销申请且通过身份核验后，您的账户将会立即被注销。账户一经注销将无法复原，请您在提交注销申请前仔细阅读本须知并谨慎操作。</text
            >
          </view>
          <view class="notice-item">
            <text class="notice-number">2.</text>
            <text class="notice-text"
              >注销成功后，您账户下的网络虚拟财产（包括已经使用或可能退回的余额、优惠券、经验值和各种权益）将会立即失效。我们建议您提前处置这些财产，例如您可以将余额提现。</text
            >
          </view>
          <view class="notice-item">
            <text class="notice-number">3.</text>
            <text class="notice-text">注销成功后，您账户下的数据和个人信息将会在15个工作日内被删除。</text>
          </view>
          <view class="notice-item">
            <text class="notice-number">4.</text>
            <text class="notice-text"
              >法律、行政法规另有规定的情况下，我们会保存您账户下的部分数据和个人信息，我们不会再次将这些数据和个人信息用于日常业务活动中。</text
            >
          </view>
          <view class="notice-item">
            <text class="notice-number">5.</text>
            <text class="notice-text">注销成功后，您仍应对您在注销成功前的行为承担相应的责任。</text>
          </view>
          <view class="notice-item">
            <text class="notice-number">6.</text>
            <text class="notice-text"
              >如果您对账户注销有任何疑问或建议，您可以通过拨打{{ COMPANY_INFO.phone }}或发送邮件至{{
                COMPANY_INFO.email
              }}联系我们。</text
            >
          </view>
          <view class="notice-item">
            <text class="notice-number">7.</text>
            <text class="notice-text"
              >同一手机号一天内累计注销2次禁止注册24小时，120天内累计注销3次禁止注册3个月，180天内累计注销4次或换绑过5个账号禁止注册一年，请谨慎操作。</text
            >
          </view>
        </view>
        <view class="popup-footer">
          <wd-button block @click="showNoticePopup = false">已阅读并申请永久注销</wd-button>
        </view>
      </view>
    </wd-popup>
    <!-- 引入更新弹窗组件 -->
    <app-update-popup
      :show="showUpdatePopup"
      :version="newVersion.version"
      :description="newVersion.description"
      :apk-url="newVersion.apkUrl"
      :force-update="newVersion.forceUpdate"
      @close="showUpdatePopup = false"
      @confirm-update="handleConfirmUpdate"
    ></app-update-popup>
  </view>
  <wd-message-box></wd-message-box>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores";
import { useMessage } from "wot-design-uni";
import { COMPANY_INFO, APP_CONFIG } from "@/utils/constants";

const message = useMessage();
const userStore = useUserStore();

const showNoticePopup = ref(false);
const showUpdatePopup = ref(false); // 控制更新弹窗显示
const newVersion = ref({
  version: "",
  description: "",
  apkUrl: "",
  forceUpdate: false,
});

const cacheSize = ref("12.5MB"); // 新增一个响应式变量来存储缓存大小

const navigateTo = (url) => {
  uni.navigateTo({ url });
};

const clearCache = () => {
  uni.showLoading({
    title: "正在清理缓存...",
    mask: true,
  });

  // 模拟异步清理过程
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: "缓存已清除",
      icon: "success",
      duration: 1500,
    });
    cacheSize.value = "0MB"; // 清除后更新缓存大小
  }, 1000);
};

const checkUpdate = () => {
  uni.showLoading({
    title: "正在检查更新...",
    mask: true,
  });

  // 模拟异步检查更新过程
  setTimeout(() => {
    uni.hideLoading();
    // 模拟从服务器获取更新信息
    const mockUpdateInfo = {
      hasNewVersion: true, // 模拟是否有新版本
      version: "1.0.1",
      description: "1. 修复了一些已知问题。\n2. 优化了用户体验。\n3. 新增了某某功能。",
      apkUrl: "https://example.com/your_app_new_version.apk", // 替换为实际的APK下载链接
      forceUpdate: true, // 是否强制更新
    };

    if (mockUpdateInfo.hasNewVersion) {
      newVersion.value = {
        version: mockUpdateInfo.version,
        description: mockUpdateInfo.description,
        apkUrl: mockUpdateInfo.apkUrl,
        forceUpdate: mockUpdateInfo.forceUpdate,
      };
      showUpdatePopup.value = true; // 显示更新弹窗
    } else {
      uni.showToast({
        title: "已是最新版本",
        icon: "success",
        duration: 1500,
      });
    }
  }, 1500);
};

const handleConfirmUpdate = () => {
  // 在这里处理用户点击“立即更新”后的逻辑
  // app-update-popup 组件内部会处理下载和安装逻辑
  console.log("用户确认更新");
};

const showLogoutNotice = () => {
  showNoticePopup.value = true;
};

const logout = () => {
  message
    .confirm({
      msg: "确定要退出登录吗?",
      title: "提示",
    })
    .then(() => {
      userStore.clearUserInfo(); // 清除用户状态
      uni.reLaunch({
        url: "/pages/login/index", // 退出后跳转到登录页
      });
      uni.showToast({
        title: "已退出登录",
        icon: "success",
      });
    })
    .catch(() => {
      // 用户取消退出
    });
};
</script>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  flex-direction: column;
}

.settings-scroll-view {
  box-sizing: border-box;
  flex: 1;
  padding: 20rpx;
}

.setting-group {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .setting-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 恢复 space-between 以适应无左侧图标的情况 */
    padding: 28rpx 30rpx;
    font-size: 32rpx;
    color: #333;

    /* 移除了针对左侧图标的样式 */

    &:not(:last-child)::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 30rpx;
      height: 1rpx;
      content: "";
      background-color: #eee;
      transform: scaleY(0.5);
      transform-origin: 0 100%;
    }

    &:active {
      background-color: #f5f5f5;
    }

    .item-text {
      flex: 1;
      line-height: 1.5;
    }

    .item-value {
      margin-right: 15rpx;
      font-size: 28rpx;
      color: #999;
    }

    .iconfont:last-child {
      font-size: 30rpx;
      color: #ccc;
    }
  }
}

.logout-section {
  padding: 20rpx 0;

  .logout-button {
    width: 100%;
    height: 90rpx;
    font-size: 34rpx;
    line-height: 90rpx;
    color: #e54d42;
    background-color: #fff;
    border: none;
    border-radius: 16rpx;

    &::after {
      border: none;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }
}

.logout-notice-popup {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 80vh;

  .popup-title {
    position: relative;
    height: 120rpx;
    padding: 30rpx;
    font-size: 36rpx;
    font-weight: bold;
    text-align: center;
    background-color: #fff;
    border-bottom: 1rpx solid #eee;

    .popup-close {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
    }
  }

  .popup-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: scroll;
    font-size: 28rpx;
    line-height: 1.8;
    color: #666;

    .notice-item {
      display: flex;
      margin-bottom: 20rpx;

      .notice-number {
        flex-shrink: 0;
        margin-right: 10rpx;
      }

      .notice-text {
        flex: 1;
      }
    }
  }

  .popup-footer {
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #eee;
  }
}
</style>
