<template>
  <view class="page">
    <z-paging
      ref="paging"
      v-model="addressList"
      empty-view-img="/static/empty/img_address_3x.png"
      empty-view-text="暂无地址"
      @query="queryList"
    >
      <!-- 地址列表 -->
      <view class="address-list">
        <view v-for="item in addressList" :key="item.id" class="address-card">
          <view class="card-content" @click="selectAddress(item)">
            <view class="address-info">
              <!-- <text class="district">{{ item.district }}</text> -->
              <text class="full-address">{{ item.address }}{{ item.doorplate }}</text>
              <text class="contact">{{ item.contact }}（{{ item.mobile }}）</text>
            </view>
            <view class="edit-btn" @click.stop="editAddress(item)">
              <!-- <text class="edit-icon">✎</text> -->
              <wd-icon name="edit-1" size="22px"></wd-icon>
            </view>
          </view>

          <view class="card-actions">
            <wd-checkbox :model-value="item.isDefault === 1" checked-color="#3b82f6" @change="(event) => setDefault(event, item)">
              <text class="default-text">{{ item.isDefault === 1 ? "已默认" : "设为默认" }}</text>
            </wd-checkbox>
            <view class="delete-btn" @click.stop="handleDeleteAddress(item)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部新增按钮 -->
      <template #bottom>
        <bottom-fixed-button :fixed="false" @click="addAddress">
          <view class="add-btn">
            <wd-icon name="add-circle1" size="36rpx" color="#fff"></wd-icon>
            <text class="add-text">新增地址</text>
          </view>
        </bottom-fixed-button>
      </template>
    </z-paging>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getAddressList, removeAddress, saveAddress } from "@/api";

const paging = ref(null);
const addressList = ref([]);

// z-paging 的查询回调
const queryList = async () => {
  try {
    const res = await getAddressList();
    paging.value.complete(res || []);
  } catch (error) {
    console.error("获取地址列表失败:", error);
    paging.value.complete(false); // 传入 false 代表请求失败
  }
};

onShow(() => {
  // 页面显示时刷新列表
  // 使用 reload() 会触发 @query
  if (paging.value) {
    paging.value.reload();
  }
});

const editAddress = (item) => {
  uni.navigateTo({
    url: `/pages/address/address-edit?type=edit&id=${item.id}`,
  });
};

const setDefault = async (event, item) => {
  const { value } = event;

  uni.showLoading({ title: "设置中..." });
  try {
    const params = {
      ...item,
      isDefault: value ? 1 : 0,
    };
    await saveAddress(params);
    uni.showToast({ title: "设置成功", icon: "success" });
    paging.value.reload(); // 刷新列表
  } catch (error) {
    console.error("设置默认地址失败:", error);
    uni.showToast({ title: "设置失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

const handleDeleteAddress = (item) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该地址吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeAddress({ addressId: item.id });
          uni.showToast({ title: "删除成功", icon: "success" });
          paging.value.reload(); // 刷新列表
        } catch (error) {
          console.error("删除地址失败:", error);
          uni.showToast({ title: "删除失败", icon: "none" });
        }
      }
    },
  });
};

const addAddress = () => {
  uni.navigateTo({
    url: "/pages/address/address-edit?type=add",
  });
};

// 如果是选择地址模式，可以点击选择
const selectAddress = (item) => {
  // 获取当前页面栈，判断是否是需要返回选择
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // 使用事件总线通知上一页
    uni.$emit("selectAddress", item);
    uni.navigateBack();
  }
};
</script>

<style lang="scss" scoped>
.back-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: #333;
}

// 地址列表
.address-list {
  flex: 1;
  padding: 24rpx;
}

.address-card {
  margin-bottom: 24rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;
}

.card-content {
  display: flex;
  padding: 32rpx;
  padding-bottom: 24rpx;
}

.address-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12rpx;

  .district {
    font-size: 26rpx;
    color: #999;
  }

  .full-address {
    font-size: 32rpx;
    font-weight: 500;
    line-height: 1.5;
    color: #333;
  }

  .contact {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: #999;
  }
}

.edit-btn {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;

  .edit-icon {
    font-size: 40rpx;
    color: #999;
  }
}

// 卡片操作区
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.default-text {
  font-size: 28rpx;
  color: #666;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 30rpx;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;

  text {
    font-size: 24rpx;
    color: #666;
  }
}

// 底部按钮
.bottom-area {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
}

.add-btn {
  display: flex;
  gap: 12rpx;
  align-items: center;
  justify-content: center;

  .add-text {
    font-size: 32rpx;
    font-weight: 500;
    color: #fff;
  }
}
</style>
