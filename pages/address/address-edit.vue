<template>
  <view class="address-edit-page">
    <view class="form-container">
      <view class="form-group">
        <view class="form-item">
          <text class="label">收货人</text>
          <input v-model="formData.name" class="input" placeholder="请填写收货人姓名" placeholder-class="placeholder" />
        </view>
        <view class="form-item">
          <text class="label">手机号</text>
          <input
            v-model="formData.phone"
            class="input"
            type="number"
            maxlength="11"
            placeholder="请填写收货人手机号"
            placeholder-class="placeholder"
          />
        </view>
        <view class="form-item" @click="handleChooseLocation">
          <text class="label">详细地址</text>
          <view class="address-select">
            <text v-if="formData.detailAddress" class="address-text">{{ formData.detailAddress }}</text>
            <text v-else class="placeholder">请选择详细地址</text>
          </view>
          <wd-icon name="location" size="32rpx" color="#999"></wd-icon>
        </view>
        <view class="form-item">
          <text class="label">楼栋门牌</text>
          <input v-model="formData.houseNumber" class="input" placeholder="请填写楼栋门牌号" placeholder-class="placeholder" />
        </view>
      </view>

      <view class="form-group mt-20">
        <view class="form-item flex-between">
          <text class="label">设为默认地址</text>
          <switch :checked="formData.isDefault" color="#4c92fc" style="transform: scale(0.8)" @change="handleSwitchChange" />
        </view>
      </view>
    </view>

    <view class="footer">
      <bottom-fixed-button @click="handleSaveAddress">
        <view class="save-btn">
          <wd-icon name="save" size="36rpx" color="#fff"></wd-icon>
          <text class="save-text">保存地址</text>
        </view>
      </bottom-fixed-button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { saveAddress, getAddressList } from "@/api";

const type = ref("add");
const currentEditId = ref(null);
const formData = reactive({
  name: "",
  phone: "",
  detailAddress: "",
  latitude: "",
  longitude: "",
  houseNumber: "", // 楼栋门牌号字段
  isDefault: false,
});

const handleChooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      formData.detailAddress = res.address + res.name;
      formData.latitude = res.latitude;
      formData.longitude = res.longitude;
    },
    fail: (err) => {
      console.error("选择位置失败：", err);
      if (err.errMsg && err.errMsg.indexOf("cancel") === -1) {
        uni.showToast({
          title: "选择位置失败，请重试",
          icon: "none",
        });
      }
    },
  });
};

onLoad((options) => {
  if (options.type === "edit" && options.id) {
    type.value = "edit";
    currentEditId.value = Number(options.id);
    getAddressList().then((data) => {
      const address = data.find((item) => item.id === currentEditId.value);
      if (address) {
        formData.detailAddress = address.address;
        formData.latitude = address.latitude;
        formData.longitude = address.longitude;
        formData.houseNumber = address.doorplate;
        formData.name = address.contact;
        formData.phone = address.mobile;
        formData.isDefault = address.isDefault === 1;
      }
    });
  } else {
    type.value = "add";
  }
});

const handleSwitchChange = (e) => {
  formData.isDefault = e.detail.value;
};

const validateForm = () => {
  if (!formData.name) {
    uni.showToast({ title: "请填写收货人姓名", icon: "none" });
    return false;
  }
  if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: "请填写正确的手机号", icon: "none" });
    return false;
  }
  if (!formData.detailAddress) {
    uni.showToast({ title: "请填写详细地址", icon: "none" });
    return false;
  }
  if (!formData.houseNumber) {
    uni.showToast({ title: "请填写楼栋门牌号", icon: "none" });
    return false;
  }
  return true;
};

const handleSaveAddress = () => {
  if (!validateForm()) {
    return;
  }

  console.log("保存地址数据:", formData);

  const params = {
    contact: formData.name,
    mobile: formData.phone,
    address: formData.detailAddress,
    latitude: formData.latitude,
    longitude: formData.longitude,
    doorplate: formData.houseNumber,
    isDefault: formData.isDefault ? 1 : 0,
  };

  if (type.value === "edit") {
    params.id = currentEditId.value;
  }

  saveAddress(params).then(() => {
    uni.showToast({
      title: type.value === "add" ? "新增地址成功" : "编辑地址成功",
      icon: "success",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  });
};

watch(
  type,
  (newType) => {
    const title = newType === "add" ? "新增服务地址" : "编辑服务地址";
    uni.setNavigationBarTitle({
      title: title,
    });
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.address-edit-page {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f5f7fa;
}

.form-container {
  padding: 24rpx;
}

.form-group {
  padding: 0 24rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;

  &.mt-20 {
    margin-top: 24rpx;
  }
}

.form-item {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.flex-between {
    justify-content: space-between;
  }

  .label {
    width: 180rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  .input {
    flex: 1;
    height: 48rpx;
    font-size: 28rpx;
    line-height: 48rpx;
    color: #333;
  }

  .address-select {
    display: flex;
    flex: 1;
    align-items: center;

    .address-text {
      padding-right: 20rpx;
      font-size: 28rpx;
      line-height: 1.5;
      color: #333;
    }
  }

  :deep(.placeholder) {
    font-size: 28rpx;
    color: #c0c4cc;
  }
}

.footer {
  .save-btn {
    display: flex;
    gap: 12rpx;
    align-items: center;
    justify-content: center;
  }
}
</style>
