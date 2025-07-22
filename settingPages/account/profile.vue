<template>
  <view class="profile-page">
    <scroll-view scroll-y class="profile-scroll-view">
      <view class="profile-item avatar-item" @click="changeAvatar">
        <text class="item-text">头像</text>
        <image
          class="avatar"
          :src="userInfo.avatar || '/static/132.jpg'"
          mode="aspectFill"
        ></image>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <view class="profile-item" @click="editNickname">
        <text class="item-text">昵称</text>
        <text class="item-value">{{ userInfo.nickname || "未设置" }}</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <view class="profile-item">
        <text class="item-text">用户ID</text>
        <text class="item-value">{{ userInfo.userId || "无" }}</text>
      </view>

      <view class="profile-item" @click="changeGender">
        <text class="item-text">性别</text>
        <text class="item-value">{{
          formatGender(userInfo.gender) || "未设置"
        }}</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <wd-datetime-picker
        v-model="userInfo.birthday"
        align-right
        type="date"
        label="生日"
        @confirm="onBirthdayConfirm"
      />

      <view
        class="profile-item"
        @click="navigateTo('/settingPages/account/security?type=phone')"
      >
        <text class="item-text">手机号</text>
        <text class="item-value">{{
          userInfo.phone ? formatPhoneNumber(userInfo.phone) : "未绑定"
        }}</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <view
        class="profile-item"
        @click="navigateTo('/settingPages/account/security?type=email')"
      >
        <text class="item-text">邮箱</text>
        <text class="item-value">{{ userInfo.email || "未绑定" }}</text>
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </scroll-view>

    <wd-action-sheet
      v-model="showActionSheet"
      :actions="actionSheet"
      @select="handleActionSheetSelect"
    />
  </view>
  <wd-message-box></wd-message-box>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores";
import { useMessage } from "wot-design-uni";

const message = useMessage();
const userStore = useUserStore();

// 模拟用户信息，实际应从 userStore 中获取
const userInfo = reactive({
  avatar: "", // 示例头像，可替换为实际图片路径
  nickname: "测试用户",
  userId: "12345678",
  gender: 1, // 0: 保密, 1: 男, 2: 女
  birthday: "1990-01-01",
  phone: "13812345678",
  email: "test@example.com",
});

// 获取用户信息的模拟方法，实际应调用 userStore 的方法
onMounted(() => {
  // 实际项目中，这里会调用接口获取用户最新信息
  // Object.assign(userInfo, userStore.userInfo);
  // 模拟从 store 加载数据
  userInfo.avatar = userStore.userInfo.avatar;
  userInfo.nickname = userStore.userInfo.nickname;
  userInfo.userId = userStore.userInfo.userId;
  userInfo.gender = userStore.userInfo.gender;
  userInfo.birthday = userStore.userInfo.birthday;
  userInfo.phone = userStore.userInfo.phone;
  userInfo.email = userStore.userInfo.email;
});

// 格式化性别显示
const formatGender = (gender) => {
  switch (gender) {
    case 1:
      return "男";
    case 2:
      return "女";
    default:
      return "保密";
  }
};

// 格式化手机号显示（隐藏中间四位）
const formatPhoneNumber = (phone) => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

// 导航到其他页面
const navigateTo = (url) => {
  uni.navigateTo({ url });
};

// 修改头像
const changeAvatar = () => {
  uni.chooseImage({
    count: 1, // 最多选择一张图片
    sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 实际开发中，这里需要上传图片到服务器
      uni.showLoading({ title: "上传中" });
      // 模拟上传
      setTimeout(() => {
        userInfo.avatar = tempFilePath; // 更新本地显示
        uni.hideLoading();
        message.success("头像更新成功");
        // 实际：调用 userStore.updateAvatar(imageUrl) 并同步到后端
      }, 1000);
    },
    fail: (err) => {
      console.error("选择图片失败", err);
      message.error("选择头像失败");
    },
  });
};

// 编辑昵称
const editNickname = () => {
  message
    .prompt({
      msg: "请输入新昵称",
      title: "修改昵称",
      inputPattern: /^.{1,10}$/, // 昵称长度1-10
      inputError: "昵称长度为1-10个字符",
      inputValue: userInfo.nickname,
      showCancel: true,
    })
    .then((value) => {
      if (value && value.trim() !== userInfo.nickname) {
        uni.showLoading({ title: "保存中" });
        // 实际：调用 userStore.updateNickname(value) 并同步到后端
        setTimeout(() => {
          userInfo.nickname = value.trim();
          uni.hideLoading();
          message.success("昵称修改成功");
        }, 500);
      }
    })
    .catch(() => {
      // 用户取消
    });
};

// 修改性别
const changeGender = () => {
  showActionSheet.value = true;
};
const showActionSheet = ref(false);
const actionSheet = [
  { name: "男", value: 1 },
  { name: "女", value: 2 },
  { name: "保密", value: 0 },
];

const handleActionSheetSelect = (item) => {
  userInfo.gender = item.item.value;
};
</script>

<style lang="scss" scoped>
:deep(.wd-picker__cell) {
  margin-bottom: 2rpx;
  padding-top: 28rpx;
  padding-botrtom: 28rpx;
}

:deep(.wd-picker__label) {
  font-size: 32rpx;
  color: #333333 !important;
}

:deep(.wd-picker__value) {
  color: #999999 !important;
  font-size: 28rpx;
}
.profile-page {
  display: flex;
  flex-direction: column;
}

.profile-scroll-view {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  background-color: #ffffff;
  font-size: 32rpx;
  color: #333333;
  position: relative;
  margin-bottom: 2rpx; /* 项目之间的微小间距，营造独立感 */

  &:first-child {
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;
  }
  &:last-of-type {
    /* 注意这里是 last-of-type, 因为可能有多个 class 为 profile-item 的元素 */
    border-bottom-left-radius: 16rpx;
    border-bottom-right-radius: 16rpx;
    margin-bottom: 20rpx; /* 组底部间距 */
  }

  /* 移除单项底部的圆角，只在组的最后项应用 */
  &:not(:first-child):not(:last-of-type) {
    border-radius: 0;
  }

  &:not(:last-of-type)::after {
    content: "";
    position: absolute;
    left: 30rpx;
    right: 0;
    bottom: 0;
    height: 1rpx;
    background-color: #eeeeee;
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
    color: #999999;
    font-size: 28rpx;
    margin-right: 15rpx;
  }

  .iconfont {
    font-size: 30rpx;
    color: #cccccc;
  }
}

.avatar-item {
  padding: 20rpx 30rpx; /* 头像项可以有更大的内边距 */
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 15rpx; /* 头像与箭头之间的间距 */
    background-color: #f0f0f0; /* 占位背景色 */
  }
  .item-text {
    align-self: center; /* 确保文本垂直居中 */
  }
}

/* 适配顶部的圆角，如果整个列表是一个组，则第一项应用圆角 */
.profile-item:first-child {
  margin-top: 0;
}
.profile-item:last-child {
  margin-bottom: 20rpx;
}

/* 针对那些不需要箭头的项，可以隐藏箭头或调整布局 */
// .profile-item:has(.item-text:contains("用户ID")) .iconfont.icon-arrow-right {
//   display: none;
// }
// .profile-item:has(.item-text:contains("用户ID")) .item-value {
//   margin-right: 0; /* 用户ID无需右侧箭头，取消右侧间距 */
// }

// 可选：如果希望所有项都在一个视觉组里，统一设置圆角
.profile-scroll-view > .profile-item:first-of-type {
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
}
.profile-scroll-view > .profile-item:last-of-type {
  border-bottom-left-radius: 16rpx;
  border-bottom-right-radius: 16rpx;
}
.profile-scroll-view > .profile-item:not(:last-of-type)::after {
  content: "";
  position: absolute;
  left: 30rpx;
  right: 0;
  bottom: 0;
  height: 1rpx;
  background-color: #eeeeee;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}
.profile-scroll-view > .profile-item {
  margin-bottom: 0; /* 移除单个item的底部margin，让其成为一个整体 */
  border-radius: 0;
}
.profile-scroll-view > .profile-item:last-of-type {
  margin-bottom: 20rpx; /* 确保整个组下方有间距 */
}

/* 保存按钮样式 (如果启用) */
.submit-section {
  padding: 40rpx 30rpx;
  .submit-button {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background-color: #007aff; /* 蓝色确认按钮 */
    color: #ffffff;
    font-size: 34rpx;
    border-radius: 16rpx;
    border: none;
    &::after {
      border: none;
    }
  }
}
</style>
