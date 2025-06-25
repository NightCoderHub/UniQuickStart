<template>
  <view>
    <wd-popup
      v-model="showPrivacyPopup"
      position="center"
      :safe-area-inset-bottom="true"
      :close-on-click-modal="false"
    >
      <view class="privacy-content">
        <view class="privacy-title">隐私保护提示</view>
        <view class="privacy-text">
          欢迎使用本小程序！为了更好地为您提供服务，我们需要获取您的部分信息。请您阅读并同意
          <text class="privacy-link" @click="gotoPrivacyPage"
            >《用户隐私协议》</text
          >。
        </view>

        <view class="privacy-buttons">
          <wd-button
            type="info"
            button-id="disagree-button"
            size="small"
            @click="handleDisagree"
            >不同意</wd-button
          >

          <wd-button
            type="primary"
            size="small"
            button-id="agree-button"
            open-type="agreePrivacyAuthorization"
            @agreeprivacyauthorization="handleAgree"
          >
            同意并继续
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- <wd-button @click="openPrivacyPopup">打开隐私弹窗 (测试)</wd-button> -->
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const showPrivacyPopup = ref(false);
// 修改为存储 resolve 函数的队列
const privacyResolvesQueue = ref([]);

onMounted(() => {
  // 在小程序启动时检查隐私授权状态
  checkPrivacyAuthorization();
});

const checkPrivacyAuthorization = () => {
  if (wx.getPrivacySetting) {
    wx.getPrivacySetting({
      success: (res) => {
        if (res.needAuthorization) {
          // 需要授权
          showPrivacyPopup.value = true;
        } else {
          // 已经授权
          console.log("用户已同意隐私协议");
        }
      },
      fail: (err) => {
        console.error("获取隐私设置失败", err);
      },
    });

    // 监听小程序隐私授权事件
    wx.onNeedPrivacyAuthorization((resolve) => {
      // 将新的 resolve 函数添加到队列中
      privacyResolvesQueue.value.push(resolve);
      showPrivacyPopup.value = true; // 显示弹窗
    });
  } else {
    // 兼容低版本微信
    console.warn("当前微信版本不支持隐私接口，请升级微信");
    showPrivacyPopup.value = true; // 强制显示弹窗，让用户知悉
  }
};

const handleAgree = () => {
  if (wx.getPrivacySetting && privacyResolvesQueue.value.length > 0) {
    // 遍历队列中的所有 resolve 函数并执行
    privacyResolvesQueue.value.forEach((resolve) => {
      resolve({
        buttonId: "agree-button",
        event: "agree",
      });
    });
  }

  showPrivacyPopup.value = false;
  // 清空队列
  privacyResolvesQueue.value = [];
};

const handleDisagree = () => {
  if (wx.getPrivacySetting && privacyResolvesQueue.value.length > 0) {
    // 遍历队列中的所有 resolve 函数并执行
    privacyResolvesQueue.value.forEach((resolve) => {
      resolve({
        buttonId: "disagree-button",
        event: "disagree",
      });
    });
    // uni.showModal({
    // 	title: '提示',
    // 	content: '您已拒绝隐私协议，部分功能可能无法使用或小程序将退出。',
    // 	showCancel: false,
    // 	confirmText: '确定',
    // 	success: () => {
    // 		wx.exitMiniProgram(); // 退出小程序
    // 	}
    // });
  }

  showPrivacyPopup.value = false;
  // 清空队列
  privacyResolvesQueue.value = [];
};

const gotoPrivacyPage = () => {
  // 跳转到微信小程序的隐私协议页

  wx.openPrivacyContract({
    success: () => {
      console.log("打开隐私协议成功");
    },
    fail: (err) => {
      console.error("打开隐私协议失败", err);
      // uni.showToast({
      // 	title: '打开隐私协议失败，请稍后再试',
      // 	icon: 'none',
      // 	duration: 2000
      // });
    },
  });
};

// const openPrivacyPopup = () => {
//   showPrivacyPopup.value = true;
// };
</script>

<style lang="scss">
.privacy-content {
  width: 600rpx;
  border-radius: 16rpx;
  padding: 40rpx;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privacy-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.privacy-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 50rpx;
}

.privacy-link {
  color: #007aff; // 蓝色链接
  text-decoration: underline;
}

.privacy-buttons {
  display: flex;
  justify-content: space-around;
  width: 100%;

  .wd-button {
    flex: 1;
    margin: 0 10rpx; // 按钮间距
  }
}
</style>
