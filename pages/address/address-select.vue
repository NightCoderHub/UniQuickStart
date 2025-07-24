<template>
  <view class="address-select-page">
    <view class="address-list-container">
      <template v-if="addresses.length > 0">
        <view
          v-for="address in addresses"
          :key="address.id"
          class="address-card"
          @click="selectAddress(address)"
        >
          <view class="address-header">
            <text class="consignee">{{ address.name }}</text>
            <text class="phone">{{ address.phone }}</text>
            <wd-tag
              v-if="address.isDefault"
              type="success"
              size="mini"
              custom-class="default-tag"
              >默认</wd-tag
            >
          </view>
          <view class="address-detail">
            <text>{{ address.fullAddress }}</text>
          </view>
          <view class="address-actions">
            <wd-button
              size="small"
              plain
              custom-style="border-color: #52c41a; color: #52c41a;"
              @click.stop="editAddress(address)"
              >编辑</wd-button
            >
            <wd-button
              size="small"
              plain
              custom-style="border-color: #f5222d; color: #f5222d; margin-left: 16rpx;"
              @click.stop="deleteAddress(address.id)"
              >删除</wd-button
            >
          </view>
        </view>
      </template>
      <template v-else>
        <view class="no-address-placeholder">
          <wd-icon name="location-o" size="64px" color="#ccc"></wd-icon>
          <text class="placeholder-text">您还没有添加收货地址</text>
        </view>
      </template>
    </view>

    <safe-area-footer :fixed="true">
      <view class="add-address-button-wrapper">
        <wd-button
          type="success"
          block
          size="large"
          @click="navigateToAddAddress"
        >
          + 添加新地址
        </wd-button>
      </view>
    </safe-area-footer>
    <wd-message-box></wd-message-box>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { useMessage } from "wot-design-uni";
const instance = getCurrentInstance().proxy;

const message = useMessage();

// 模拟地址数据，实际应用中这些数据会从后端获取
const addresses = ref([
  {
    id: "1",
    name: "张三",
    phone: "13812345678",
    fullAddress: "贵州省铜仁市碧江区早到日货市场1号楼101室",
    isDefault: true,
  },
  {
    id: "2",
    name: "李四",
    phone: "13987654321",
    fullAddress: "贵州省铜仁市万山区高新技术开发区创新大厦A座",
    isDefault: false,
  },
]);

// 选择地址并返回
const selectAddress = (address) => {
  console.log("选中地址:", address);
  const eventChannel = instance.getOpenerEventChannel();
  eventChannel.emit("onAddressSelected", {
    data: address.fullAddress,
  });
  uni.navigateBack();
};

// 跳转到添加新地址页面
const navigateToAddAddress = () => {
  uni.navigateTo({
    url: "/pages/address/address-edit?type=add",
  });
};

// 编辑地址
const editAddress = (address) => {
  console.log("编辑地址:", address);
  uni.navigateTo({
    url: `/pages/address/address-edit?type=edit&id=${address.id}`, // 传递地址ID，或者整个地址对象（如果大小允许）
  });
};

// 删除地址
const deleteAddress = (id) => {
  message
    .confirm({
      title: "确认删除",
      message: "确定要删除该地址吗？",
    })
    .then(() => {
      console.log("确认删除地址:", id);
      // 实际删除逻辑：调用API
      addresses.value = addresses.value.filter((addr) => addr.id !== id);
      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
    })
    .catch(() => {
      console.log("取消删除");
    });
};
</script>

<style lang="scss" scoped>
.address-select-page {
  display: flex;
  flex-direction: column;
}

.address-list-container {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

.address-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 5%);

  &:last-child {
    margin-bottom: 0;
  }

  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;

    .consignee {
      margin-right: 16rpx;
    }

    .phone {
      font-size: 28rpx;
      color: #666;
    }

    .default-tag {
      margin-left: 16rpx;

      /* 更柔和的蓝色 */
      color: #1890ff;
      background-color: #e6f7ff;
      border: 1px solid #91d5ff;
    }
  }

  .address-detail {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    line-height: 1.5;
    color: #666;
  }

  .address-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.no-address-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  font-size: 32rpx;
  color: #999;

  .placeholder-text {
    margin-top: 32rpx;
  }
}

.add-address-button-wrapper {
  padding: 24rpx;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
