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
          <text class="info-item"
            >是否有桶>
            <text class="info-item-detail">有桶</text>
          </text>
          <text class="info-item"
            >规格>
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
        <text class="more-text">更多</text>
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
          custom-style="border-color: #52c41a;  margin-left: 24rpx;"
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

          <wd-button type="success" size="small" @click="makeAppointment">
            去预约
          </wd-button>
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
        <!-- <view class="help-icon">?</view> -->
      </view>

      <view class="term-item">
        <wd-checkbox v-model="agreedToTerms" checked-color="#40c393"
          >我已阅读并且同意《该服务合同协议》等</wd-checkbox
        >
      </view>
    </view>

    <view class="bottom-bar">
      <view class="appointment-info" @click="selectTime">
        <wd-icon name="clock" color="#52c41a" size="20px"></wd-icon>
        <text class="appointment-text">选预约</text>
        <wd-icon name="arrow-right" color="#ccc" size="16px"></wd-icon>
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

// Reactive data
const orderNotes = ref("");
const selectedPrice = ref("platform"); // platform | user
const userPrice = ref("");
const platformPrice = ref("16.00");

// Using wd-checkbox-group for 'invoice' and 'receipt'
const selectedOrderOptions = ref([]);

// Individual boolean checkboxes
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
  },
  {
    avatar: "/static/default_avator.png",
    name: "李师傅",
    rating: "4.8",
    serviceCount: "15+",
    distance: "3.5",
    availableTime: "今天 14:00",
    serviceTags: ["空调安装", "热水器维修"],
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
  },
]);
const activeTechnicianTab = ref("nearby");

const displayedTechnicians = computed(() => {
  return activeTechnicianTab.value === "nearby"
    ? nearbyTechnicians.value
    : favoriteTechnicians.value;
});
// Get wd-message-box instance
const message = useMessage();

const finalDisplayPrice = computed(() => {
  if (selectedPrice.value === "platform") {
    return platformPrice.value;
  } else if (selectedPrice.value === "user") {
    // 如果用户出价为空或无效，可以考虑返回平台价格或默认值
    return userPrice.value || "0.00"; // 确保有默认值，避免显示空白
  }
  return "0.00"; // 默认值
});

const deliveryAddress = ref("铜仁市碧江区早到日货市场"); // 初始化为默认地址或空

const selectAddress = () => {
  console.log("选择地址");
  // 使用uni.navigateTo跳转到地址选择页面
  uni.navigateTo({
    url: "/pages/address/address-select", // 假设你的地址选择页面路径是这个
    events: {
      // 监听从地址选择页面返回时传递的事件
      onAddressSelected: function (data) {
        console.log("data", data);
        if (data && data.address) {
          deliveryAddress.value = data.address; // 更新地址
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
      inputPattern: /^\d+(\.\d{1,2})?$/, // Validate number format, up to two decimal places
      inputErrorMessage: "请输入有效的价格",
    })
    .then((resp) => {
      // 成功输入后更新 userPrice
      userPrice.value = resp.value;
      // 再次确认选中用户出价，以防用户取消输入后selectedPrice变回platform
      selectedPrice.value = "user";
    })
    .catch(() => {
      // 用户取消或输入无效时，可以保持当前选中的价格不变，或者根据需求回到平台价格
      // selectedPrice.value = "platform"; // 如果希望取消后回到平台价格，则取消这行注释
    });
};

const makeAppointment = () => {
  console.log("预约技师");
  // Navigate to appointment page
};

const selectTime = () => {
  console.log("选择预约时间");
  // Show time picker
};

const confirmBooking = () => {
  console.log("确认预约");
  // Submit booking information
  console.log("选中的订单选项 (开票/回单):", selectedOrderOptions.value);
  console.log("是否开启号码保护:", phoneProtection.value);
  console.log("是否同意服务合同协议:", agreedToTerms.value);

  // You can check if a specific option is selected like this:
  // const wantsInvoice = selectedOrderOptions.value.includes('invoice');
  // const wantsReceipt = selectedOrderOptions.value.includes('receipt');

  uni.showToast({
    title: "预约成功",
    icon: "success",
  });
};
</script>

<style lang="scss" scoped>
/* Your styles remain unchanged */
.service-detail {
  // background: #fff;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 产品展示区域 */
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
    font-size: 14px;

    .info-item {
      color: $color-gray-500;
    }

    .info-item-detail {
      color: #000;
    }
  }
}

/* 地址区域 */
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
      margin-right: 12px;
    }

    .address-item-detail {
      flex: 1;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      height: 100%;
    }

    .address-text {
      flex: 1;
      // margin-left: 12px;
      color: #000;
      font-size: 16px;
    }
  }
}

/* 价格区域 */
.price-section {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 24rpx;

  .price-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .price-radio {
      width: 36rpx;
      height: 36rpx;
      border: 2px solid #d9d9d9;
      border-radius: 50%;
      margin-right: 12px;
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
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
        }
      }
    }

    .price-label {
      flex: 1;
      color: #333;
      font-size: 16px;
    }

    .price-value {
      display: flex;
      align-items: baseline;
      margin-right: 8px;

      .price-number {
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }

      .price-unit {
        font-size: 14px;
        color: #333;
        margin-left: 2px;
      }
    }

    .price-placeholder {
      color: #999;
      margin-right: 8px;
    }
  }
}

:deep(.wd-checkbox) {
  margin-bottom: 0;
}

/* 订单备注区域 */
.notes-section {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 24rpx;

  .section-title {
    display: block;
    color: #333;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .options-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;

    .option-group {
      display: flex;
      gap: 24px;
    }

    .more-text {
      color: #999;
      font-size: 14px;
    }
  }
}

:deep(.wd-input::after) {
  background: #f5f5f5;
}

/* 技师选择区域 */
.technician-section {
  // padding: 24rpx 0;

  .technician-tabs {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 12rpx;
    margin-bottom: 12rpx;
    margin-right: 24rpx;

    .favorite-text {
      color: #999;
      font-size: 14px;
      margin-left: 24rpx;
    }
  }
  .no-technicians {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 16px;
  }

  .technician-card {
    background: #fff;
    padding: 16px;
    border-bottom: 1rpx solid #f5f5f5;
    .technician-info {
      display: flex;
      gap: 12px;

      .technician-details {
        flex: 1;

        .technician-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .technician-name {
            font-weight: 500;
            color: #333;
          }

          .technician-rating {
            color: #fac701;
            font-size: 14px;
          }
        }

        .technician-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;

          .stats-text,
          .distance-text {
            color: #999;
            font-size: 12px;
          }
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;

          .available-time {
            color: #333;
            font-size: 14px;
          }
        }

        .service-tags {
          display: flex;
          gap: 8px;

          .custom-tag {
            display: flex;
            align-items: center;
            justify-content: center;
            // width: 94rpx;
            // height: 32rpx;
            padding: 6rpx 10rpx;
            border-radius: 17rpx;
            background: rgba(64, 195, 146, 0.3);
            color: #1da875;
            font-size: 18rpx;
          }
        }
      }
    }
  }
}

/* 条款区域 */
.terms-section {
  padding: 16px;

  .term-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;

    .term-check {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      // background: #52c41a;
      position: relative;
      margin-top: 2px;

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        background: #fff;
        border-radius: 50%;
      }
    }

    .term-text {
      flex: 1;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    }

    .help-icon {
      width: 16px;
      height: 16px;
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #999;
    }
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .appointment-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .appointment-text {
      color: #333;
      font-size: 16px;
    }
  }

  .price-action {
    display: flex;
    align-items: center;
    gap: 12px;

    .final-price {
      display: flex;
      align-items: baseline;

      .price-number {
        font-size: 24px;
        font-weight: bold;
        color: #ff4d4f;
      }

      .price-unit {
        font-size: 14px;
        color: #ff4d4f;
        margin-left: 2px;
      }
    }
  }
}
</style>
