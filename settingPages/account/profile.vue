<template>
  <view class="profile-page">
    <scroll-view scroll-y class="profile-scroll-view">
      <!-- 基本信息 -->
      <view class="profile-group">
        <view class="profile-item avatar-item" @click="changeAvatar">
          <text class="item-label">头像</text>
          <view class="item-content">
            <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.jpg'" mode="aspectFill"></image>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="profile-item" @click="editNickname">
          <text class="item-label">昵称</text>
          <view class="item-content">
            <text class="item-value">{{ userInfo.nickname || "未设置" }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="profile-item" @click="changeGender">
          <text class="item-label">性别</text>
          <view class="item-content">
            <text class="item-value">{{ formatGender(userInfo.gender) }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <wd-datetime-picker
          v-model="userInfo.birthday"
          align-right
          :min-date="new Date(1960, 0, 1).getTime()"
          :max-date="new Date().getTime()"
          type="date"
          label="生日"
          @confirm="saveProfile"
        />
      </view>

      <!-- 联系方式 -->
      <view class="profile-group">
        <view class="profile-item">
          <text class="item-label">手机号</text>
          <view class="item-content">
            <text class="item-value">{{ userInfo.phone ? userInfo.phone : "未绑定" }}</text>
          </view>
        </view>

        <view class="profile-item" @click="editEmail">
          <text class="item-label">邮箱</text>
          <view class="item-content">
            <text class="item-value">{{ userInfo.email || "未绑定" }}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 安全设置 -->
      <view class="profile-group">
        <view class="profile-item" @click="changePassword">
          <text class="item-label">修改密码</text>
          <view class="item-content">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部保存按钮 -->
    <view class="submit-section">
      <bottom-fixed-button :fixed="false" size="large" @click="saveProfile">保 存</bottom-fixed-button>
    </view>

    <!-- 组件 -->
    <wd-action-sheet v-model="showActionSheet" :actions="actionSheet" @select="handleActionSheetSelect" />
    <wd-message-box></wd-message-box>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores";
import { useMessage, useUpload } from "wot-design-uni";
import { getUserInfo, updateUserInfo } from "@/api";
import { uploadActionUrl } from "@/utils/constants";

const message = useMessage();
const userStore = useUserStore();

// 模拟用户信息，实际应从 userStore 中获取
const userInfo = reactive({
  avatar: "", // 示例头像，可替换为实际图片路径
  nickname: "",
  gender: "0", // 0: 保密, 1: 男, 2: 女
  birthday: "",
  phone: "",
  email: "",
});

// 获取用户信息的模拟方法，实际应调用 userStore 的方法
onMounted(() => {
  getUserInfo().then((data) => {
    Object.assign(userInfo, data, {
      phone: data.mobile,
      // 将时间戳转换为Date对象
      birthday: data.birthday ? new Date(parseInt(data.birthday)).getTime() : "",
    });
  });
});

// 格式化性别显示
const formatGender = (gender) => {
  switch (gender) {
    case "1":
      return "男";
    case "2":
      return "女";
    default:
      return "保密";
  }
};

// 格式化手机号显示（隐藏中间四位）
// const formatPhoneNumber = (phone) => {
//   if (!phone || phone.length !== 11) return phone;
//   return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
// };

// 修改头像
const changeAvatar = async () => {
  const { startUpload, chooseFile, UPLOAD_STATUS } = useUpload();

  try {
    // 使用chooseFile替代uni.chooseImage
    const files = await chooseFile({
      accept: "image",
      multiple: false,
      maxCount: 1,
    });
    if (files && files.length > 0) {
      const tempFilePath = files[0].path;

      // 构建上传文件对象
      const file = {
        url: tempFilePath,
        status: UPLOAD_STATUS.PENDING,
        percent: 0,
        uid: new Date().getTime(),
      };

      uni.showLoading({ title: "上传中" });

      try {
        // 开始上传
        await startUpload(file, {
          action: uploadActionUrl,
          header: {
            "e-token": userStore.token,
          },
          onSuccess: (res) => {
            console.log("上传成功", res);
            const data = JSON.parse(res.data);
            userInfo.avatar = data.data; // 假设服务器返回的数据中包含url字段
            uni.showToast({
              title: "头像更新成功",
              icon: "none",
            });
            saveProfile();
          },
          onError: (err) => {
            console.error("上传失败", err);
            uni.showToast({
              title: "头像上传失败",
              icon: "none",
            });
          },
          onProgress: (res) => {
            console.log("上传进度:", res.progress);
          },
        });
      } catch (error) {
        console.error("上传失败:", error);
        uni.showToast({
          title: "头像上传失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    }
  } catch (err) {
    console.error("选择图片失败", err);
    uni.showToast({
      title: "选择头像失败",
      icon: "none",
    });
  }
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
    .then(({ value }) => {
      if (value && value.trim() !== userInfo.nickname) {
        userInfo.nickname = value.trim();
        saveProfile();
      }
    })
    .catch(() => {
      // 用户取消
    });
};

// 编辑邮箱
const editEmail = () => {
  message
    .prompt({
      msg: "请输入新邮箱",
      title: "修改邮箱",
      inputPattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, // 邮箱格式
      inputError: "请输入正确的邮箱格式",
      inputValue: userInfo.email,
      showCancel: true,
    })
    .then(({ value }) => {
      if (value && value.trim() !== userInfo.email) {
        userInfo.email = value.trim();
        saveProfile();
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
  { name: "男", value: "1" },
  { name: "女", value: "2" },
  { name: "保密", value: "0" },
];

const handleActionSheetSelect = (item) => {
  userInfo.gender = item.item.value;
  saveProfile();
};

const changePassword = () => {
  uni.navigateTo({ url: "/settingPages/account/change-password" });
};

const saveProfile = () => {
  uni.showLoading({ title: "保存中" });
  const params = {
    nickname: userInfo.nickname,
    avatar: userInfo.avatar,
    mobile: userInfo.phone,
    gender: parseInt(userInfo.gender), // 转换为整数类型
    email: userInfo.email,
    birthday: userInfo.birthday ? userInfo.birthday.toString() : "", // 转换为字符串类型
  };
  updateUserInfo(params)
    .then(() => {
      userStore.updateProfile(params);
      uni.showToast({
        title: "保存成功",
        icon: "none",
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};
</script>

<style lang="scss" scoped>
.profile-page {
  display: flex;
  flex-direction: column;
}

.profile-scroll-view {
  box-sizing: border-box;
  flex: 1;
  padding: 20rpx;
}

.profile-group {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;
}

.profile-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  font-size: 32rpx;
  color: #333;
  background-color: #fff;
  transition: background-color 0.2s;

  &:active {
    background-color: #f9f9f9;
  }

  /* 分隔线：除了每一组的最后一个元素 */
  &:not(:last-child)::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 30rpx;
    height: 1px;
    content: "";
    background-color: #eee;
    transform: scaleY(0.5);
  }

  .item-label {
    flex: 1;
    font-weight: 400;
  }

  .item-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .item-value {
    margin-right: 12rpx;
    font-size: 28rpx;
    color: #999;
  }

  .iconfont {
    font-size: 32rpx;
    color: #c7c7cc;
  }
}

.avatar-item {
  padding: 24rpx 30rpx;

  .avatar {
    display: block;
    width: 100rpx;
    height: 100rpx;
    margin-right: 12rpx;
    background-color: #f0f0f0;
    border-radius: 50%;
  }
}

/* 底部按钮区域 */
.submit-section {
  padding-top: 30rpx;
}
</style>

<style scoped>
/* 覆盖 wot-design 组件样式以匹配 profile-item */
:deep(.wd-picker__cell) {
  padding: 30rpx !important;
  font-size: 32rpx !important;
  line-height: normal !important;
  color: #333 !important;
  background-color: #fff !important;
  border-bottom: none !important;

  /* 确保 label 样式一致 */
  .wd-picker__label {
    font-size: 32rpx !important;
    line-height: normal !important;
    color: #333 !important;
  }

  /* 确保 value 样式一致 */
  .wd-picker__value {
    font-size: 28rpx !important;
    line-height: normal !important;
    color: #999 !important;
  }

  /* 调整 picker 内部箭头的位置或样式 */
  .wd-picker__arrow {
    right: 30rpx !important;
    font-size: 32rpx !important;
    color: #c7c7cc !important;
  }

  /* 分隔线 */
  &::after {
    left: 30rpx !important;
    display: block;
    background-color: #eee !important;
  }
}

:deep(.wd-cell__value) {
  margin-right: 12rpx;
  color: #999 !important;
}
</style>
