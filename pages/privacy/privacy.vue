<template>
  <view class="container">
    <view v-if="showPrivacyModal" class="modal privacy-modal">
      <view class="modal-header">
        <text class="modal-title">隐私政策和用户协议</text>
        <text class="modal-subtitle"
          >为了更好地向您提供服务，我们需要您同意本应用的《隐私政策》和《用户协议》。</text
        >
      </view>
      <view class="modal-content">
        <scroll-view scroll-y>
          <text class="content-heading">一、我们如何收集和使用您的信息</text>
          <text class="content-paragraph"
            >我们会根据合法、正当、必要的原则，收集和使用您在使用服务过程中主动提供或因使用服务而产生的个人信息。如果我们将您的信息用于本隐私政策中未载明的其他用途，会事先征求您的同意。</text
          >
          <text class="content-heading"
            >二、我们如何共享、转让、公开披露您的个人信息</text
          >
          <text class="content-paragraph"
            >我们不会与任何公司、组织和个人共享您的个人信息，但以下情况除外： 1.
            在获取明确同意的情况下共享； 2.
            根据法律法规的规定或强制性的行政司法要求所必须提供您的信息； 3.
            仅为实现本隐私政策中声明的目的，我们的某些服务将由授权合作伙伴提供。</text
          >
          <text class="content-heading">三、您的权利</text>
          <text class="content-paragraph"
            >您有权访问、更正、删除您的个人信息，也有权撤回授权同意、注销账号。详情请参阅我们的完整隐私政策。</text
          >
          <text class="content-heading">四、联系我们</text>
          <text class="content-paragraph"
            >如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：[您的联系方式，例如：support@example.com]</text
          >
        </scroll-view>
      </view>

      <view class="modal-actions">
        <button class="button button-danger" @click="showSecondConfirm">
          不同意
        </button>
        <button class="button button-primary" @click="agreePrivacy">
          同意
        </button>
      </view>
    </view>

    <view v-if="showSecondConfirmModal" class="modal second-confirm-modal">
      <view class="modal-header">
        <text class="modal-title">重要提示</text>
        <text class="modal-subtitle"
          >如果您不同意隐私政策，我们将无法为您提供基本服务，并可能无法继续使用本应用。</text
        >
      </view>
      <view class="modal-actions">
        <button class="button button-secondary" @click="reconsider">
          重新考虑
        </button>
        <button class="button button-danger" @click="exitApp">
          仍不同意并退出
        </button>
      </view>
    </view>

    <view v-if="showSecondConfirmModal" class="overlay"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPrivacyModal: true,
      showSecondConfirmModal: false,
    };
  },
  methods: {
    agreePrivacy() {
      console.log("用户点击同意隐私协议");
      uni.setStorageSync("privacy_policy_agreed", true);
      this.showPrivacyModal = false;
      uni.reLaunch({
        url: "/pages/index/index",
      });
    },
    showSecondConfirm() {
      console.log("用户点击不同意，显示二次确认");
      this.showSecondConfirmModal = true;
    },
    reconsider() {
      console.log("用户选择重新考虑");
      this.showSecondConfirmModal = false;
      this.showPrivacyModal = true;
    },
    exitApp() {
      console.log("用户选择仍不同意，退出应用");
      // #ifdef MP
      uni.showModal({
        title: "提示",
        content: "您已选择不同意隐私政策，将无法使用本应用，请手动退出。",
        showCancel: false,
        confirmText: "我知道了",
        success: (res) => {
          if (res.confirm) {
            this.showPrivacyModal = false;
            this.showSecondConfirmModal = false;
            uni.showToast({
              title: "请手动退出应用",
              icon: "none",
              duration: 3000,
            });
          }
        },
      });
      // #endif

      // #ifndef MP
      this.showSecondConfirmModal = false;
      this.showPrivacyModal = false;
      uni.showModal({
        title: "无法继续",
        content: "您已选择不同意隐私政策，无法使用本应用。请退出应用。",
        showCancel: false,
        confirmText: "我知道了",
        success: (res) => {
          if (res.confirm) {
            console.log("用户已知晓，应用将阻止进一步操作");
          }
        },
      });
      uni.setStorageSync("privacy_policy_denied", true);
      // #endif
    },
  },
  onLoad() {
    const privacyAgreed = uni.getStorageSync("privacy_policy_agreed");
    if (privacyAgreed) {
      uni.reLaunch({
        url: "/pages/index/index",
      });
    }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 32rpx;
  box-sizing: border-box;
}

.modal {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow:
    0 20rpx 30rpx -6rpx rgba(0, 0, 0, 0.1),
    0 8rpx 12rpx -4rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 768rpx;
  overflow: hidden;
  transform: scale(1);
  opacity: 1;
  transition: all 0.3s ease-out;
}

.second-confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: 50;
}

.modal-header {
  padding: 48rpx;
  border-bottom: 2rpx solid #e5e7eb;
}

.modal-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
  display: block;
  margin-bottom: 16rpx;
}

.modal-subtitle {
  font-size: 28rpx;
  color: #4b5563;
}

.modal-content {
  max-height: 512rpx;
  padding: 48rpx;
  font-size: 28rpx;
  color: #374151;
  line-height: 1.625;
  overflow-y: auto;
}

.content-heading {
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.content-paragraph {
  display: block;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 32rpx;
  background-color: #f9fafb;
  border-top: 2rpx solid #e5e7eb;
  gap: 24rpx;
}

.button {
  flex: 1;
  border-radius: 12rpx;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-shadow:
    0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1),
    0 2rpx 4rpx 0 rgba(0, 0, 0, 0.06);
}

.button-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.button-primary:hover {
  background-color: #1d4ed8;
}

.button-primary:focus {
  box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.5);
}

.button-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.button-danger:hover {
  background-color: #dc2626;
}

.button-danger:focus {
  box-shadow: 0 0 0 4rpx rgba(239, 68, 68, 0.5);
}

.second-confirm-modal .button-danger {
  background-color: #dc2626;
}
.second-confirm-modal .button-danger:hover {
  background-color: #b91c1c;
}
.second-confirm-modal .button-danger:focus {
  box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.5);
}

.button-secondary {
  background-color: #d1d5db;
  color: #1f2937;
}

.button-secondary:hover {
  background-color: #9ca3af;
}

.button-secondary:focus {
  box-shadow: 0 0 0 4rpx rgba(156, 163, 175, 0.5);
}

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}
</style>
