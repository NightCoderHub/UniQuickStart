<template>
  <view class="profile-page">
    <scroll-view scroll-y class="profile-scroll-view">
      <view class="profile-group">
        <view class="profile-item avatar-item group-item-first" @click="changeAvatar">
          <text class="item-text">头像</text>
          <image class="avatar" :src="userInfo.avatar || '/static/132.jpg'" mode="aspectFill"></image>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="item-separator"></view>

        <view class="profile-item" @click="editNickname">
          <text class="item-text">昵称</text>
          <text class="item-value">{{ userInfo.nickname || "未设置" }}</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="item-separator"></view>

        <view class="profile-item">
          <text class="item-text">用户ID</text>
          <text class="item-value">{{ userInfo.userId || "无" }}</text>
        </view>
        <view class="item-separator"></view>

        <view class="profile-item" @click="changeGender">
          <text class="item-text">性别</text>
          <text class="item-value">{{ formatGender(userInfo.gender) || "未设置" }}</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="item-separator"></view>

        <view class="profile-item group-item-last" @click="showBirthdayPicker = true">
          <text class="item-text">生日</text>
          <text class="item-value">{{ userInfo.birthday || "未设置" }}</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>

      <view class="profile-group security-group">
        <view class="profile-item group-item-first" @click="navigateTo('/settingPages/account/security?type=phone')">
          <text class="item-text">手机号</text>
          <text class="item-value">{{ userInfo.phone ? formatPhoneNumber(userInfo.phone) : "未绑定" }}</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
        <view class="item-separator"></view>

        <view class="profile-item group-item-last" @click="navigateTo('/settingPages/account/security?type=email')">
          <text class="item-text">邮箱</text>
          <text class="item-value">{{ userInfo.email || "未绑定" }}</text>
          <wd-icon name="arrow-right" size="33rpx" color="#ccc"></wd-icon>
        </view>
      </view>
    </scroll-view>

    <wd-action-sheet v-model="showActionSheet" :actions="actionSheet" @select="handleActionSheetSelect" />
    <wd-datetime-picker
      v-model="userInfo.birthday"
      v-model:show="showBirthdayPicker"
      align-right
      type="date"
      label="生日"
      @confirm="onBirthdayConfirm"
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

// 控制生日选择器显示
const showBirthdayPicker = ref(false);

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

// 生日选择器确认
const onBirthdayConfirm = (value) => {
  userInfo.birthday = value.value;
  showBirthdayPicker.value = false;
};
</script>

<style lang="scss" scoped>
// Picker component deep styles
:deep(.wd-picker__cell) {
  padding-top: 28rpx;
  padding-bottom: 28rpx;
}

:deep(.wd-picker__label) {
  font-size: 32rpx;
  color: #333 !important;
}

:deep(.wd-picker__value) {
  font-size: 28rpx;
  color: #999 !important;
}

.profile-page {
  display: flex;
  flex-direction: column;
}

.profile-scroll-view {
  box-sizing: border-box;
  flex: 1;
  padding: 20rpx;
}

// Group container for a block of profile items
.profile-group {
  margin-bottom: 20rpx; /* Spacing between groups */
  overflow: hidden; /* Ensures content respects border-radius */
  background-color: #fff;
  border-radius: 16rpx;
}

.profile-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  font-size: 32rpx;
  color: #333;

  // Active state
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
}

// Separator between profile items within a group
.item-separator {
  height: 1rpx;
  margin-left: 30rpx; /* Align with item text padding */
  background-color: #eee;
  transform: scaleY(0.5); /* For sharper line on high-DPI screens */
  transform-origin: 0 100%;
}

.avatar-item {
  padding: 20rpx 30rpx;

  .avatar {
    width: 100rpx;
    height: 100rpx;
    margin-right: 15rpx;
    background-color: #f0f0f0;
    border-radius: 50%;
  }

  .item-text {
    align-self: center;
  }
}

// No .submit-section found in the template, so its styles are removed.
</style>
