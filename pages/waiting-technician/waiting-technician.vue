<template>
  <view class="waiting-page">
    <!-- 地图容器 -->
    <view class="map-container">
      <map
        id="map"
        :longitude="longitude"
        :latitude="latitude"
        :scale="16"
        :markers="markers"
        :circles="circles"
        class="map"
        @markertap="onMarkerTap"
      >
        <!-- 呼叫状态气泡 -->
        <cover-view class="call-status-bubble">
          <cover-view class="bubble-content">
            已呼叫{{ calledCount }}位
          </cover-view>
          <cover-view class="bubble-arrow"></cover-view>
        </cover-view>
      </map>

      <!-- 定位按钮 -->
      <view class="location-btn" @click="centerToLocation">
        <wd-icon name="crosshairs-gps" size="24px" color="#666"></wd-icon>
      </view>
    </view>

    <!-- 底部状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="status-title">正在呼叫附近师傅</text>
        <view class="loading-spinner">
          <wd-loading type="spinner" size="16px" color="#fff"></wd-loading>
        </view>
      </view>
      <text class="status-desc">90%的订单在2分钟内有应答，请等待......</text>
    </view>

    <!-- 订单信息 -->
    <view class="order-info">
      <!-- 地址信息 -->
      <view class="info-item" @click="editAddress">
        <view class="info-icon location-icon">
          <wd-icon name="location" size="20px" color="#52c41a"></wd-icon>
        </view>
        <text class="info-text">{{ orderInfo.address }}</text>
        <wd-icon name="arrow-right" size="16px" color="#ccc"></wd-icon>
      </view>

      <!-- 金额信息 -->
      <view class="info-item" @click="editPrice">
        <view class="info-icon price-icon">
          <wd-icon name="gold-coin" size="20px" color="#faad14"></wd-icon>
        </view>
        <view class="info-content">
          <text class="info-label">金额</text>
          <text class="info-value">{{ orderInfo.price }}元</text>
        </view>
        <wd-icon name="edit" size="16px" color="#ccc"></wd-icon>
      </view>

      <!-- 备注信息 -->
      <view class="info-item" @click="editNotes">
        <view class="info-icon notes-icon">
          <wd-icon name="info-circle" size="20px" color="#1890ff"></wd-icon>
        </view>
        <view class="info-content">
          <text class="info-label">订单追加备注</text>
          <text v-if="!orderInfo.notes" class="info-placeholder"
            >请输入备注</text
          >
          <text v-else class="info-value">{{ orderInfo.notes }}</text>
        </view>
        <wd-icon name="edit" size="16px" color="#ccc"></wd-icon>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <wd-popup
      v-model="showEditPopup"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editTitle }}</text>
          <wd-button type="text" @click="closeEditPopup">取消</wd-button>
        </view>
        <view class="popup-content">
          <wd-input
            v-model="editValue"
            :placeholder="editPlaceholder"
            :type="editType"
            auto-focus
          ></wd-input>
        </view>
        <view class="popup-footer">
          <wd-button type="primary" block @click="confirmEdit">确认</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 地图相关
      longitude: 109.191242,
      latitude: 27.718245,
      calledCount: 9,

      // 地图标记和圆圈
      markers: [
        {
          id: 1,
          longitude: 109.191242,
          latitude: 27.718245,
          iconPath: "/static/location-pin.png",
          width: 30,
          height: 30,
          callout: {
            content: "",
            display: "ALWAYS",
          },
        },
      ],

      circles: [
        {
          longitude: 109.191242,
          latitude: 27.718245,
          radius: 500,
          strokeWidth: 2,
          strokeColor: "#52c41a",
          fillColor: "rgba(82, 196, 26, 0.1)",
        },
        {
          longitude: 109.191242,
          latitude: 27.718245,
          radius: 200,
          strokeWidth: 2,
          strokeColor: "#52c41a",
          fillColor: "rgba(82, 196, 26, 0.2)",
        },
      ],

      // 订单信息
      orderInfo: {
        address: "铜仁市碧江区早到日货市场",
        price: "16.00",
        notes: "",
      },

      // 编辑弹窗
      showEditPopup: false,
      editType: "address", // address, price, notes
      editTitle: "",
      editPlaceholder: "",
      editValue: "",

      // 定时器
      callTimer: null,
      statusTimer: null,
    };
  },

  onLoad() {
    this.startCalling();
    this.startStatusCheck();
  },

  onUnload() {
    this.clearTimers();
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 开始呼叫师傅
    startCalling() {
      this.callTimer = setInterval(() => {
        if (this.calledCount < 20) {
          this.calledCount++;
        }
      }, 3000);
    },

    // 开始状态检查
    startStatusCheck() {
      // 模拟2分钟后有师傅接单
      // this.statusTimer = setTimeout(() => {
      //   this.onTechnicianAccepted()
      // }, 120000)
    },

    // 师傅接单
    onTechnicianAccepted() {
      uni.showToast({
        title: "师傅已接单",
        icon: "success",
      });

      setTimeout(() => {
        uni.redirectTo({
          url: "/pages/technician-info/technician-info",
        });
      }, 1500);
    },

    // 清除定时器
    clearTimers() {
      if (this.callTimer) {
        clearInterval(this.callTimer);
      }
      if (this.statusTimer) {
        clearTimeout(this.statusTimer);
      }
    },

    // 定位到中心
    centerToLocation() {
      const mapContext = uni.createMapContext("map", this);
      mapContext.moveToLocation({
        longitude: this.longitude,
        latitude: this.latitude,
      });
    },

    // 地图标记点击
    onMarkerTap(e) {
      console.log("marker tap", e);
    },

    // 编辑地址
    editAddress() {
      this.editType = "address";
      this.editTitle = "修改地址";
      this.editPlaceholder = "请输入地址";
      this.editValue = this.orderInfo.address;
      this.showEditPopup = true;
    },

    // 编辑价格
    editPrice() {
      this.editType = "price";
      this.editTitle = "修改金额";
      this.editPlaceholder = "请输入金额";
      this.editValue = this.orderInfo.price;
      this.showEditPopup = true;
    },

    // 编辑备注
    editNotes() {
      this.editType = "notes";
      this.editTitle = "订单备注";
      this.editPlaceholder = "请输入备注";
      this.editValue = this.orderInfo.notes;
      this.showEditPopup = true;
    },

    // 关闭编辑弹窗
    closeEditPopup() {
      this.showEditPopup = false;
    },

    // 确认编辑
    confirmEdit() {
      if (this.editType === "address") {
        this.orderInfo.address = this.editValue;
      } else if (this.editType === "price") {
        this.orderInfo.price = this.editValue;
      } else if (this.editType === "notes") {
        this.orderInfo.notes = this.editValue;
      }

      this.showEditPopup = false;

      uni.showToast({
        title: "修改成功",
        icon: "success",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.waiting-page {
  height: 100vh;
  background: #fff;
  position: relative;
}

/* 地图容器 */
.map-container {
  position: relative;
  height: calc(100vh - 400px);

  .map {
    width: 100%;
    height: 100%;
  }

  .call-status-bubble {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;

    .bubble-content {
      background: #52c41a;
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      white-space: nowrap;
    }

    .bubble-arrow {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #52c41a;
      margin: 0 auto;
    }
  }

  .location-btn {
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
    background: #fff;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* 状态卡片 */
.status-card {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  margin: 16px;
  padding: 16px;
  border-radius: 12px;
  color: #fff;

  .status-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .status-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .status-desc {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }
}

/* 订单信息 */
.order-info {
  padding: 0 16px 100px;

  .info-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      &.location-icon {
        background: rgba(82, 196, 26, 0.1);
      }

      &.price-icon {
        background: rgba(250, 173, 20, 0.1);
      }

      &.notes-icon {
        background: rgba(24, 144, 255, 0.1);
      }
    }

    .info-text {
      flex: 1;
      color: #333;
      font-size: 16px;
    }

    .info-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      .info-label {
        color: #333;
        font-size: 16px;
      }

      .info-value {
        color: #333;
        font-size: 16px;
        font-weight: 500;
      }

      .info-placeholder {
        color: #999;
        font-size: 16px;
      }
    }
  }
}

/* 编辑弹窗 */
.edit-popup {
  background: #fff;
  border-radius: 12px 12px 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .popup-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  .popup-content {
    padding: 20px 16px;
  }

  .popup-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
