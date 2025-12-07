<template>
  <view class="system-permissions-page">
    <scroll-view scroll-y class="permissions-scroll-view">
      <view class="permission-intro">
        <text>为了提供更好的用户体验，{{ COMPANY_INFO.name }}会获取以下系统权限</text>
      </view>
      <view class="setting-group">
        <view class="setting-item">
          <text class="item-text">位置信息</text>
          <view class="item-right">
            <text class="item-value">{{ permissions.location }}</text>
            <text class="iconfont icon-arrow-right" @click="openSystemSettings('location')"></text>
          </view>
        </view>
        <text class="permission-description">用于获取您的当前位置，以便提供基于地理位置的服务，如社区动态等。</text>
        <view class="setting-item">
          <text class="item-text">相机</text>
          <view class="item-right">
            <text class="item-value">{{ permissions.camera }}</text>
            <text class="iconfont icon-arrow-right" @click="openSystemSettings('camera')"></text>
          </view>
        </view>
        <text class="permission-description">用于拍摄照片或视频，例如发布动态、更换头像等。</text>
        <view class="setting-item">
          <text class="item-text">麦克风</text>
          <view class="item-right">
            <text class="item-value">{{ permissions.microphone }}</text>
            <text class="iconfont icon-arrow-right" @click="openSystemSettings('microphone')"></text>
          </view>
        </view>
        <text class="permission-description">用于录制音频，例如发布语音动态、进行语音通话等。</text>
        <view class="setting-item">
          <text class="item-text">相册</text>
          <view class="item-right">
            <text class="item-value">{{ permissions.album }}</text>
            <text class="iconfont icon-arrow-right" @click="openSystemSettings('album')"></text>
          </view>
        </view>
        <text class="permission-description">用于访问您的相册，以便选择图片或视频上传，例如发布动态、更换头像等。</text>
        <view class="setting-item">
          <text class="item-text">通知</text>
          <view class="item-right">
            <text class="item-value">{{ permissions.notification }}</text>
            <text class="iconfont icon-arrow-right" @click="openSystemSettings('notification')"></text>
          </view>
        </view>
        <text class="permission-description">用于接收应用消息通知，例如新评论、点赞等。</text>
        <!-- 更多权限项可以根据需要添加 -->
      </view>

      <view class="permission-tip">
        <text>提示：部分权限需要您前往系统设置中手动开启或关闭。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { COMPANY_INFO } from "@/constants";

const permissions = ref({
  location: "未设置",
  camera: "未设置",
  microphone: "未设置",
  album: "未设置",
  notification: "未设置",
});

// 检查权限状态
const checkPermissionStatus = async () => {
  // Uniapp 提供了 uni.getAppAuthorizeSetting 来获取应用授权设置
  // 但不同平台（微信小程序、App等）获取权限的方式和返回结果可能不同
  // 这里提供一个通用示例，具体实现需要根据目标平台进行调整
  // 微信小程序和App的权限管理方式有差异，以下代码主要针对App平台，小程序需要使用wx.getSetting等API

  // 示例：检查位置权限
  // uni.getSetting 适用于小程序，uni.getAppAuthorizeSetting 适用于App
  // 为了兼容性，这里使用 try-catch 尝试不同API
  try {
    const auth = await uni.getAppAuthorizeSetting();
    console.log("App授权设置:", auth);
    if (auth.locationAuthorized) {
      permissions.value.location = "已授权";
    } else if (auth.locationDenied) {
      permissions.value.location = "已拒绝";
    } else {
      permissions.value.location = "未设置";
    }

    if (auth.cameraAuthorized) {
      permissions.value.camera = "已授权";
    } else if (auth.cameraDenied) {
      permissions.value.camera = "已拒绝";
    } else {
      permissions.value.camera = "未设置";
    }

    if (auth.microphoneAuthorized) {
      permissions.value.microphone = "已授权";
    } else if (auth.microphoneDenied) {
      permissions.value.microphone = "已拒绝";
    } else {
      permissions.value.microphone = "未设置";
    }

    if (auth.albumAuthorized) {
      permissions.value.album = "已授权";
    } else if (auth.albumDenied) {
      permissions.value.album = "已拒绝";
    } else {
      permissions.value.album = "未设置";
    }

    if (auth.notificationAuthorized) {
      permissions.value.notification = "已授权";
    } else if (auth.notificationDenied) {
      permissions.value.notification = "已拒绝";
    } else {
      permissions.value.notification = "未设置";
    }
  } catch (e) {
    console.error("获取应用授权设置失败:", e);
    // 尝试使用 uni.getSetting (适用于小程序)
    uni.getSetting({
      success(res) {
        console.log("uni.getSetting:", res.authSetting);
        if (res.authSetting["scope.userFuzzyLocation"]) {
          permissions.value.location = "已授权";
        } else if (res.authSetting["scope.userFuzzyLocation"] === false) {
          permissions.value.location = "已拒绝";
        } else {
          permissions.value.location = "未设置";
        }
        // 更多权限判断
        if (res.authSetting["scope.camera"]) {
          permissions.value.camera = "已授权";
        } else if (res.authSetting["scope.camera"] === false) {
          permissions.value.camera = "已拒绝";
        } else {
          permissions.value.camera = "未设置";
        }
        if (res.authSetting["scope.record"]) {
          // 麦克风
          permissions.value.microphone = "已授权";
        } else if (res.authSetting["scope.record"] === false) {
          permissions.value.microphone = "已拒绝";
        } else {
          permissions.value.microphone = "未设置";
        }
        if (res.authSetting["scope.writePhotosAlbum"] || res.authSetting["scope.album"]) {
          // 相册
          permissions.value.album = "已授权";
        } else if (res.authSetting["scope.writePhotosAlbum"] === false || res.authSetting["scope.album"] === false) {
          permissions.value.album = "已拒绝";
        } else {
          permissions.value.album = "未设置";
        }
        // 通知权限在小程序中通常通过 uni.getSetting 的 'scope.notification' 或直接在系统设置中管理
        // 这里简化处理，实际可能需要更复杂的判断
        permissions.value.notification = "请前往系统设置查看";
      },
      fail(err) {
        console.error("uni.getSetting 调用失败:", err);
      },
    });
  }
};

// 打开系统设置
const openSystemSettings = () => {
  // uni.openAppAuthorizeSetting 适用于App，小程序需要 uni.openSetting
  uni.openAppAuthorizeSetting({
    success(res) {
      console.log("打开应用授权设置成功", res);
      // 从系统设置返回后，重新检查权限状态
      checkPermissionStatus();
    },
    fail(err) {
      console.error("打开应用授权设置失败", err);
      uni.showToast({
        title: "无法打开系统设置，请手动前往。",
        icon: "none",
        duration: 2000,
      });
    },
  });
};

onMounted(() => {
  checkPermissionStatus();
});

// 页面显示时重新检查权限状态，确保从系统设置返回后状态更新
onShow(() => {
  checkPermissionStatus();
});
</script>

<style lang="scss" scoped>
.system-permissions-page {
  display: flex;
  flex-direction: column;
}

.permissions-scroll-view {
  box-sizing: border-box;
  flex: 1;
  padding: 20rpx;
}

.setting-group {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: $uni-border-radius-lg;

  .setting-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 30rpx;
    font-size: 32rpx;
    color: #333;

    // &:not(:last-child)::after {
    //   content: "";
    //   position: absolute;
    //   left: 30rpx;
    //   right: 0;
    //   bottom: 0;
    //   height: 1rpx;
    //   background-color: #eeeeee;
    //   transform: scaleY(0.5);
    //   transform-origin: 0 100%;
    // }

    &:active {
      background-color: #f5f5f5;
    }

    .item-text {
      flex: 1;
      line-height: 1.5;
    }

    .item-right {
      display: flex;
      align-items: center;
    }

    .item-value {
      margin-right: 15rpx;
      font-size: 28rpx;
      color: #999;
    }

    .iconfont {
      font-size: 30rpx;
      color: #ccc;
    }
  }
}

.permission-description {
  display: block;
  padding: 0 30rpx 20rpx;
  font-size: 24rpx;
  line-height: 1.4;
  color: #666;
  border-bottom: 1px solid #eee;
}

.permission-tip {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}

.permission-intro {
  margin-bottom: 20rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #666;
  background-color: #f8f8f8;
  border-radius: $uni-border-radius-lg;
}
</style>
