<template>
  <view class="service-detail">
    <!-- 产品展示区域 -->
    <view class="product-section">
      <view class="product-image">
        <image
          src="/static/water-jug.png"
          mode="aspectFit"
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

    <!-- 地址区域 -->
    <view class="address-section" @click="selectAddress">
      <view class="address-item">
        <!-- <wd-icon class-prefix="iconfont" name="location" color="#52c41a" size="20px"></wd-icon> -->
        <text class="iconfont icon-dingwei-shifuduan"></text>
        <text class="address-text">铜仁市碧江区早到日货市场</text>
        <wd-icon name="arrow-right" color="#000" size="16px"></wd-icon>
      </view>
    </view>

    <!-- 价格区域 -->
    <view class="price-section">
      <view class="price-item active">
        <view class="price-radio active"></view>
        <text class="price-label">平台价格</text>
        <view class="price-value">
          <text class="price-number">16.00</text>
          <text class="price-unit">元</text>
        </view>
        <wd-icon name="arrow-right" color="#000" size="16px"></wd-icon>
      </view>

      <view class="price-item" @click="showUserPrice">
        <view class="price-radio"></view>
        <text class="price-label">用户出价</text>
        <text class="price-placeholder">请出价</text>
        <wd-icon name="edit" color="#ccc" size="16px"></wd-icon>
      </view>
    </view>

    <!-- 订单备注区域 -->
    <view class="notes-section">
      <text class="section-title">订单备注</text>
      <wd-input
        v-model="orderNotes"
        placeholder="请输入备注"
        :border="false"
        custom-style="background: #f5f5f5; border-radius: 8px; padding: 12px;"
      ></wd-input>

      <view class="options-row">
        <view class="option-group">
          <wd-checkbox v-model="needInvoice">开票</wd-checkbox>
          <wd-checkbox v-model="needReceipt">回单</wd-checkbox>
        </view>
        <text class="more-text">更多</text>
      </view>
    </view>

    <!-- 技师选择区域 -->
    <view class="technician-section">
      <view class="technician-tabs">
        <wd-button
          type="success"
          size="small"
          :plain="true"
          custom-style="border-color: #52c41a; color: #52c41a;"
        >
          附近技师
        </wd-button>
        <text class="favorite-text">收藏技师</text>
      </view>

      <!-- 技师卡片 -->
      <view class="technician-card">
        <view class="technician-info">
          <image
            src="/static/default_avator.png"
            style="width: 150rpx; height: 150rpx"
          ></image>

          <view class="technician-details">
            <view class="technician-header">
              <wd-tag type="success" size="mini">快速上门</wd-tag>
              <text class="technician-name">兰菊清</text>
              <text class="technician-rating">5.0分</text>
            </view>

            <view class="technician-stats">
              <text class="stats-text">已服务：20+单</text>
              <text class="distance-text">距离2.01km</text>
            </view>

            <view class="availability">
              <wd-tag type="warning" size="mini" :plain="true">最早可约</wd-tag>
              <text class="available-time">12:00</text>
            </view>

            <view class="service-tags">
              <wd-tag type="primary" size="mini" :plain="true">冰箱维修</wd-tag>
              <wd-tag type="primary" size="mini" :plain="true">彩电维修</wd-tag>
            </view>
          </view>

          <wd-button type="success" size="small" @click="makeAppointment">
            去预约
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 条款区域 -->
    <view class="terms-section">
      <view class="term-item">
        <view class="term-check active"></view>
        <text class="term-text">号码保护全程隐藏您的真实手机号</text>
        <view class="help-icon">?</view>
      </view>

      <view class="term-item">
        <view class="term-check active"></view>
        <text class="term-text">我已阅读并且同意《该服务合同协议》等</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="appointment-info" @click="selectTime">
        <wd-icon name="clock" color="#52c41a" size="20px"></wd-icon>
        <text class="appointment-text">选预约</text>
        <wd-icon name="arrow-right" color="#ccc" size="16px"></wd-icon>
      </view>

      <view class="price-action">
        <view class="final-price">
          <text class="price-number">16.00</text>
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
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderNotes: "",
      needInvoice: false,
      needReceipt: false,
      selectedPrice: "platform", // platform | user
      userPrice: "",
    };
  },

  methods: {
    selectAddress() {
      console.log("选择地址");
      // 跳转到地址选择页面
    },

    showUserPrice() {
      this.selectedPrice = "user";
      // 显示用户出价输入框
      uni.showModal({
        title: "用户出价",
        editable: true,
        placeholderText: "请输入价格",
        success: (res) => {
          if (res.confirm) {
            this.userPrice = res.content;
          }
        },
      });
    },

    makeAppointment() {
      console.log("预约技师");
      // 跳转到预约页面
    },

    selectTime() {
      console.log("选择预约时间");
      // 显示时间选择器
    },

    confirmBooking() {
      console.log("确认预约");
      // 提交预约信息
      uni.showToast({
        title: "预约成功",
        icon: "success",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.service-detail {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 120px;
}

/* 产品展示区域 */
.product-section {
  background: #fff;
  padding: 24px 16px;
  text-align: center;

  .product-image {
    margin-bottom: 16px;

    .jug-image {
      width: 96px;
      height: 128px;
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
  border-bottom: 1px solid #f0f0f0;

  .address-item {
    display: flex;
    align-items: center;
    padding: 16px;
    .icon-dingwei-shifuduan {
      color: $color-success;
      font-size: 42rpx;
    }
    .address-text {
      flex: 1;
      margin-left: 12px;
      color: #000;
      font-size: 16px;
    }
  }
}

/* 价格区域 */
.price-section {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px;

  .price-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .price-radio {
      width: 20px;
      height: 20px;
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

/* 订单备注区域 */
.notes-section {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px;

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

/* 技师选择区域 */
.technician-section {
  padding: 16px;

  .technician-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .favorite-text {
      color: #999;
      font-size: 14px;
    }
  }

  .technician-card {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 16px;

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
            color: #ff8c00;
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
      background: #52c41a;
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
  padding: 12px 16px;
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
