<template>
  <view class="service-detail">
    <wd-card>
      <view class="product-section">
        <view class="product-image">
          <image
            src="/static/water-jug.png"
            mode="widthFix"
            class="jug-image"
          ></image>
        </view>
        <view class="product-info">
          <text class="info-item">
            是否有桶>
            <text class="info-item-detail">有桶</text>
          </text>
          <text class="info-item">
            规格>
            <text class="info-item-detail">1桶</text>
          </text>
        </view>
      </view>
    </wd-card>

    <view class="address-section" @click="selectAddress">
      <view class="address-item">
        <text class="iconfont icon-dingwei-shifuduan"></text>
        <view class="address-item-detail">
          <text class="address-text">{{
            deliveryAddress || "请选择配送地址"
          }}</text>
          <wd-icon name="arrow-right" color="#000" size="16px"></wd-icon>
        </view>
      </view>
    </view>

    <view class="price-section">
      <view
        class="price-item"
        :class="{ active: selectedPrice === 'platform' }"
        @click="selectedPrice = 'platform'"
      >
        <view
          class="price-radio"
          :class="{ active: selectedPrice === 'platform' }"
        ></view>
        <text class="price-label">平台价格</text>
        <view class="price-value">
          <text class="price-number">{{ platformPrice }}</text>
          <text class="price-unit">元</text>
        </view>
        <wd-icon name="arrow-right" color="#000" size="16px"></wd-icon>
      </view>

      <view
        class="price-item"
        :class="{ active: selectedPrice === 'user' }"
        @click="handleShowUserPrice"
      >
        <view
          class="price-radio"
          :class="{ active: selectedPrice === 'user' }"
        ></view>
        <text class="price-label">用户出价</text>
        <text class="price-placeholder">{{ userPrice || "请出价" }}</text>
        <wd-icon name="edit" color="#ccc" size="16px"></wd-icon>
      </view>
    </view>

    <view class="notes-section">
      <text class="section-title">订单备注</text>
      <wd-input
        v-model="orderNotes"
        placeholder="请输入备注"
        :border="false"
        custom-style="background: #f5f5f5; border-radius: 8px; padding: 12px;"
      ></wd-input>

      <view class="options-row">
        <wd-checkbox-group v-model="selectedOrderOptions" class="option-group">
          <wd-checkbox
            shape="square"
            model-value="invoice"
            checked-color="#40c393"
            >开票</wd-checkbox
          >
          <wd-checkbox
            shape="square"
            model-value="receipt"
            checked-color="#40c393"
            >回单</wd-checkbox
          >
        </wd-checkbox-group>
      </view>
    </view>

    <view class="technician-section">
      <view class="technician-tabs">
        <wd-button
          type="success"
          size="small"
          :plain="activeTechnicianTab !== 'nearby'"
          custom-style="border-color: #52c41a; "
          @click="activeTechnicianTab = 'nearby'"
        >
          附近技师
        </wd-button>
        <wd-button
          type="success"
          size="small"
          :plain="activeTechnicianTab !== 'favorite'"
          custom-style="border-color: #52c41a; margin-left: 24rpx;"
          @click="activeTechnicianTab = 'favorite'"
        >
          收藏技师
        </wd-button>
      </view>

      <view
        v-for="technician in displayedTechnicians"
        :key="technician.name"
        class="technician-card"
      >
        <view class="technician-info">
          <image
            src="/static/default_avator.png"
            style="width: 150rpx; height: 150rpx"
          ></image>
          <view class="technician-details">
            <view class="technician-header">
              <wd-tag type="success" size="mini">快速上门</wd-tag>
              <text class="technician-name">{{ technician.name }}</text>
              <text class="technician-rating">{{ technician.rating }}分</text>
            </view>

            <view class="technician-stats">
              <text class="stats-text"
                >已服务：{{ technician.serviceCount }}单</text
              >
              <text class="distance-text">距离{{ technician.distance }}km</text>
            </view>

            <view class="availability">
              <wd-tag type="warning" size="mini" :plain="true">最早可约</wd-tag>
              <text class="available-time">{{ technician.availableTime }}</text>
            </view>

            <view class="service-tags">
              <view
                v-for="(tag, index) in technician.serviceTags"
                :key="index"
                class="custom-tag"
              >
                {{ tag }}
              </view>
            </view>
          </view>

          <view class="actions-group">
            <wd-icon
              :name="technician.isFavorite ? 'star-filled' : 'star'"
              :color="technician.isFavorite ? '#ffc107' : '#999'"
              size="24px"
              class="favorite-icon"
              @click.stop="toggleFavorite(technician)"
            ></wd-icon>
            <wd-button
              type="success"
              size="small"
              :disabled="technician.isBooked"
              @click="makeAppointment(technician)"
            >
              {{ technician.isBooked ? "已预约" : "去预约" }}
            </wd-button>
          </view>
        </view>
      </view>
      <view v-if="displayedTechnicians.length === 0" class="no-technicians">
        暂无技师
      </view>
    </view>

    <view class="terms-section">
      <view class="term-item">
        <wd-checkbox v-model="phoneProtection" checked-color="#40c393"
          >号码保护全程隐藏您的真实手机号</wd-checkbox
        >
      </view>

      <view class="term-item">
        <wd-checkbox v-model="agreedToTerms" checked-color="#40c393">
          我已阅读并且同意
        </wd-checkbox>
        <text class="agreement-link" @click="showAgreement"
          >《服务合同协议》</text
        >
      </view>
    </view>

    <view class="bottom-bar">
      <view class="appointment-info" @click="selectTime">
        <view>
          <wd-icon name="clock" color="#52c41a" size="20px"></wd-icon>
          <text class="appointment-text"> 选预约 </text>
        </view>
        <wd-datetime-picker
          ref="datetimePicker"
          :min-date="minDate"
          :max-date="maxDate"
          type="datetime"
          @confirm="onTimeConfirm"
        ></wd-datetime-picker>
      </view>

      <view class="price-action">
        <view class="final-price">
          <text class="price-number">{{ finalDisplayPrice }}</text>
          <text class="price-unit">元</text>
        </view>
        <wd-button
          type="primary"
          size="large"
          block
          :custom-style="{ borderRadius: '16rpx' }"
          @click="confirmBooking"
        >
          立马安排
        </wd-button>
      </view>
    </view>
    <wd-message-box></wd-message-box>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMessage } from "wot-design-uni";

const orderNotes = ref("");
const selectedPrice = ref("platform");
const userPrice = ref("");
const platformPrice = ref("16.00");

const selectedOrderOptions = ref([]);

const phoneProtection = ref(false);
const agreedToTerms = ref(false);

const nearbyTechnicians = ref([
  {
    avatar: "/static/default_avator.png",
    name: "兰菊清",
    rating: "5.0",
    serviceCount: "20+",
    distance: "2.01",
    availableTime: "今天 12:00",
    serviceTags: ["冰箱维修", "彩电维修"],
    isFavorite: false,
    isBooked: false,
  },
  {
    avatar: "/static/default_avator.png",
    name: "李师傅",
    rating: "4.8",
    serviceCount: "15+",
    distance: "3.5",
    availableTime: "今天 14:00",
    serviceTags: ["空调安装", "热水器维修"],
    isFavorite: false,
    isBooked: false,
  },
]);

const favoriteTechnicians = ref([
  {
    avatar: "/static/default_avator.png",
    name: "王小芳",
    rating: "4.9",
    serviceCount: "30+",
    distance: "1.2",
    availableTime: "今天 10:30",
    serviceTags: ["洗衣机维修", "燃气灶安装"],
    isFavorite: true,
    isBooked: false,
  },
]);

const toggleFavorite = (technician) => {
  technician.isFavorite = !technician.isFavorite;

  uni.showToast({
    title: technician.isFavorite ? "已收藏" : "已取消收藏",
    icon: "none",
  });

  const targetList =
    activeTechnicianTab.value === "nearby"
      ? favoriteTechnicians.value
      : nearbyTechnicians.value;
  const foundInOtherList = targetList.find((t) => t.name === technician.name);
  if (foundInOtherList) {
    foundInOtherList.isFavorite = technician.isFavorite;
  }
};

const activeTechnicianTab = ref("nearby");

const selectedTime = ref("");
const showTimePicker = ref(false);

const minDate = new Date().getTime();
const maxDate = new Date(
  new Date().setMonth(new Date().getMonth() + 3),
).getTime();

const displayedTechnicians = computed(() => {
  return activeTechnicianTab.value === "nearby"
    ? nearbyTechnicians.value
    : favoriteTechnicians.value;
});
const message = useMessage();

const finalDisplayPrice = computed(() => {
  if (selectedPrice.value === "platform") {
    return platformPrice.value;
  } else if (selectedPrice.value === "user") {
    return userPrice.value || "0.00";
  }
  return "0.00";
});

const deliveryAddress = ref("铜仁市碧江区早到日货市场");

const selectAddress = () => {
  console.log("选择地址");
  uni.navigateTo({
    url: "/pages/address/address-select",
    events: {
      onAddressSelected: function (data) {
        console.log("data", data);
        if (data && data.address) {
          deliveryAddress.value = data.address;
          uni.showToast({
            title: "地址已更新",
            icon: "none",
          });
        }
      },
    },
  });
};

const handleShowUserPrice = () => {
  selectedPrice.value = "user";
  message
    .prompt({
      title: "用户出价",
      inputValue: userPrice.value,
      inputPlaceholder: "请输入价格",
      inputPattern: /^\d+(\.\d{1,2})?$/,
      inputErrorMessage: "请输入有效的价格",
    })
    .then((resp) => {
      userPrice.value = resp.value;
      selectedPrice.value = "user";
    })
    .catch(() => {});
};

const selectedTechnician = ref(null);

const makeAppointment = (technician) => {
  if (technician.isBooked) {
    uni.showToast({
      title: "该技师已被预约，请选择其他技师",
      icon: "none",
    });
    return;
  }

  console.log("尝试预约技师", technician);
  selectedTechnician.value = technician;

  uni.showToast({
    title: `已选择技师：${technician.name}`,
    icon: "none",
  });

  technician.isBooked = true;

  const otherList =
    activeTechnicianTab.value === "nearby"
      ? favoriteTechnicians.value
      : nearbyTechnicians.value;
  const foundInOtherList = otherList.find((t) => t.name === technician.name);
  if (foundInOtherList) {
    foundInOtherList.isBooked = true;
  }
};

const selectTime = () => {
  console.log("选择预约时间");
  showTimePicker.value = true;
};

const onTimeConfirm = ({ value }) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  selectedTime.value = `${year}-${month}-${day} ${hours}:${minutes}`;
  showTimePicker.value = false;
  uni.showToast({
    title: `预约时间：${selectedTime.value}`,
    icon: "none",
  });
};

const showAgreement = () => {
  uni.navigateTo({
    url: "/pages/agreement/agreement",
  });
};

const confirmBooking = () => {
  console.log("确认预约");
  if (!deliveryAddress.value) {
    uni.showToast({
      title: "请选择配送地址",
      icon: "none",
    });
    return;
  }
  if (
    selectedPrice.value === "user" &&
    (!userPrice.value || parseFloat(userPrice.value) <= 0)
  ) {
    uni.showToast({
      title: "请输入有效的用户出价",
      icon: "none",
    });
    return;
  }
  if (!selectedTime.value) {
    uni.showToast({
      title: "请选择预约时间",
      icon: "none",
    });
    return;
  }
  if (!agreedToTerms.value) {
    uni.showToast({
      title: "请阅读并同意服务合同协议",
      icon: "none",
    });
    return;
  }

  const orderData = {
    productId: "your_product_id",
    deliveryAddress: deliveryAddress.value,
    selectedPriceType: selectedPrice.value,
    price:
      selectedPrice.value === "platform"
        ? platformPrice.value
        : userPrice.value,
    orderNotes: orderNotes.value,
    options: selectedOrderOptions.value,
    phoneProtection: phoneProtection.value,
    appointmentTime: selectedTime.value,
    technicianId: selectedTechnician.value ? selectedTechnician.value.id : null,
  };

  console.log("提交的订单数据:", orderData);

  uni.navigateTo({
    url: "/pages/waiting-technician/waiting-technician",
  });
};
</script>

<style lang="scss" scoped>
.service-detail {
  min-height: 100vh;
  padding-bottom: 200rpx;
}

.product-section {
  text-align: center;

  .product-image {
    margin-bottom: 32rpx;

    .jug-image {
      width: 120rpx;
    }
  }

  .product-info {
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 28rpx;

    .info-item {
      color: $color-gray-500;
    }

    .info-item-detail {
      color: #000;
    }
  }
}

.address-section {
  background-color: #fff;

  .address-item {
    display: flex;
    align-items: center;
    height: 100rpx;
    padding: 0 24rpx;

    .icon-dingwei-shifuduan {
      color: $color-success;
      font-size: 42rpx;
      margin-right: 24rpx;
    }

    .address-item-detail {
      flex: 1;
      border-bottom: 2rpx solid #f0f0f0;
      display: flex;
      align-items: center;
      height: 100%;
    }

    .address-text {
      flex: 1;
      color: #000;
      font-size: 32rpx;
    }
  }
}

.price-section {
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
  padding: 24rpx;

  .price-item {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .price-radio {
      width: 36rpx;
      height: 36rpx;
      border: 4rpx solid #d9d9d9;
      border-radius: 50%;
      margin-right: 24rpx;
      position: relative;

      &.active {
        border-color: #52c41a;
        background: #52c41a;

        &::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16rpx;
          height: 16rpx;
          background: #fff;
          border-radius: 50%;
        }
      }
    }

    .price-label {
      flex: 1;
      color: #333;
      font-size: 32rpx;
    }

    .price-value {
      display: flex;
      align-items: baseline;
      margin-right: 16rpx;

      .price-number {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
      }

      .price-unit {
        font-size: 28rpx;
        color: #333;
        margin-left: 4rpx;
      }
    }

    .price-placeholder {
      color: #999;
      margin-right: 16rpx;
    }
  }
}

:deep(.wd-checkbox) {
  margin-bottom: 0;
}

.notes-section {
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
  padding: 24rpx;

  .section-title {
    display: block;
    color: #333;
    font-size: 32rpx;
    font-weight: 500;
    margin-bottom: 24rpx;
  }

  .options-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 32rpx;

    .option-group {
      display: flex;
      gap: 48rpx;
    }
  }
}

:deep(.wd-input::after) {
  background: #f5f5f5;
}

.technician-section {
  .technician-tabs {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 24rpx;
    margin-bottom: 24rpx;
    margin-right: 24rpx;
  }

  .no-technicians {
    text-align: center;
    padding: 80rpx;
    color: #999;
    font-size: 32rpx;
  }

  .technician-card {
    background: #fff;
    padding: 32rpx;
    border-bottom: 2rpx solid #f5f5f5;

    .technician-info {
      display: flex;
      gap: 24rpx;

      .technician-details {
        flex: 1;

        .technician-header {
          display: flex;
          align-items: center;
          gap: 16rpx;
          margin-bottom: 16rpx;

          .technician-name {
            font-weight: 500;
            color: #333;
          }

          .technician-rating {
            color: #fac701;
            font-size: 28rpx;
          }
        }

        .technician-stats {
          display: flex;
          gap: 32rpx;
          margin-bottom: 24rpx;

          .stats-text,
          .distance-text {
            color: #999;
            font-size: 24rpx;
          }
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 16rpx;
          margin-bottom: 24rpx;

          .available-time {
            color: #333;
            font-size: 28rpx;
          }
        }

        .service-tags {
          display: flex;
          gap: 16rpx;

          .custom-tag {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6rpx 10rpx;
            border-radius: 17rpx;
            background: rgba(64, 195, 146, 0.3);
            color: #1da875;
            font-size: 18rpx;
          }
        }
      }

      .actions-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12rpx;

        .favorite-icon {
          cursor: pointer;
        }
      }
    }
  }
}

.terms-section {
  padding: 32rpx;

  .term-item {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin-bottom: 16rpx;

    .agreement-link {
      color: #007bff;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 2rpx solid #f0f0f0;
  padding: 24rpx;

  .appointment-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .appointment-text {
      color: #333;
      font-size: 32rpx;
    }
  }

  .price-action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 24rpx;

    .final-price {
      display: flex;
      align-items: baseline;

      .price-number {
        font-size: 48rpx;
        font-weight: bold;
        color: #ff4d4f;
      }

      .price-unit {
        font-size: 28rpx;
        color: #ff4d4f;
        margin-left: 4rpx;
      }
    }
  }
}

:deep(.wd-picker__cell) {
  padding-right: 0;
}
</style>
