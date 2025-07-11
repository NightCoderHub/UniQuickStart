<template>
  <view class="waiting-page">
    <view class="map-container">
      <map
        id="map"
        :longitude="longitude"
        :latitude="latitude"
        :scale="16"
        :markers="markers"
        class="map"
        @markertap="onMarkerTap"
      >
        <cover-view class="call-status-bubble">
          <cover-view class="bubble-content">
            {{ callStatusMessage }}
          </cover-view>
          <cover-view class="bubble-arrow"></cover-view>
        </cover-view>
      </map>

      <!-- <view class="location-btn" @click="centerToLocation">
        <wd-icon name="crosshairs-gps" size="24px" color="#666"></wd-icon>
      </view> -->
    </view>

    <view class="status-card">
      <view class="status-header">
        <text class="status-title">{{ currentStatusTitle }}</text>
        <view class="loading-spinner">
          <wd-loading type="ring" size="16px" color="#fff"></wd-loading>
        </view>
      </view>
      <text class="status-desc">{{ currentStatusDesc }}</text>

      <wd-button
        type="warning"
        block
        size="small"
        custom-class="cancel-btn"
        @click="showCancelOrderConfirm = true"
        >取消订单</wd-button
      >
    </view>

    <view class="order-info">
      <view class="info-item" @click="editItem('address')">
        <view class="info-icon location-icon">
          <text class="iconfont icon-dingwei-shifuduan"></text>
        </view>
        <text class="info-text">{{ orderInfo.address }}</text>
        <text class="edit-text">修改</text>
      </view>

      <view class="info-item" @click="editItem('price')">
        <view class="info-icon price-icon">
          <!-- <text class="iconfont icon-jine"></text> -->
          <image class="image" src="/static/jine.png"></image>
        </view>
        <view class="info-content">
          <text class="info-label">金额</text>
          <text class="info-value">{{ orderInfo.price }}元</text>
        </view>
        <text class="edit-text">修改</text>
      </view>

      <view class="info-item" @click="editItem('notes')">
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
        <text class="edit-text">修改</text>
      </view>
    </view>

    <wd-popup
      v-model="showEditPopup"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editPopupData.title }}</text>
          <wd-button type="text" @click="closeEditPopup">取消</wd-button>
        </view>
        <view class="popup-content">
          <wd-input
            v-model="editPopupData.value"
            :placeholder="editPopupData.placeholder"
            :type="editPopupData.type"
            :focus="showEditPopup"
          ></wd-input>
        </view>
        <view class="popup-footer">
          <wd-button type="primary" block @click="confirmEdit">确认</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showCancelOrderConfirm"
      position="center"
      :close-on-click-modal="false"
      custom-class="cancel-confirm-popup"
      custom-style="border-radius:32rpx;width: 80%;"
    >
      <view class="cancel-popup-content">
        <text class="cancel-popup-title">确认取消订单？</text>
        <text class="cancel-popup-desc"
          >取消后，您可能需要重新发起呼叫，部分情况下可能会产生取消费用。</text
        >
        <view class="cancel-popup-buttons">
          <wd-button size="small" @click="showCancelOrderConfirm = false"
            >再等等</wd-button
          >
          <wd-button size="small" type="error" @click="cancelOrder"
            >确定取消</wd-button
          >
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showLongWaitTip"
      position="center"
      :close-on-click-modal="false"
      custom-class="long-wait-popup"
      custom-style="border-radius:32rpx;width: 80%;"
    >
      <view class="long-wait-content">
        <text class="long-wait-title">暂无师傅接单</text>
        <text class="long-wait-desc"
          >抱歉，长时间未有师傅接单，您可以尝试以下操作：</text
        >
        <wd-button
          custom-class="long-wait-btn"
          block
          size="small"
          type="primary"
          @click="increasePrice"
          >增加订单金额</wd-button
        >
        <wd-button
          block
          size="small"
          custom-class="long-wait-btn"
          @click="republishOrder"
          >重新发布订单</wd-button
        >
        <wd-button
          block
          size="small"
          custom-class="long-wait-btn"
          @click="contactCustomerService"
          >联系客服</wd-button
        >
        <wd-button
          block
          size="small"
          type="info"
          custom-class="long-wait-btn"
          @click="showLongWaitTip = false"
          >取消</wd-button
        >
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";

// 常量定义
const CALL_INTERVAL = 3000; // 呼叫师傅计数器更新间隔
const MAX_CALLED_COUNT = 20; // 最大呼叫师傅数
const ACCEPT_ORDER_DELAY = 6000; // 模拟师傅接单延迟 (6秒钟)
const LONG_WAIT_THRESHOLD = 60000; // 模拟长时间等待的阈值 (1分钟)

// --- 响应式数据 ---
// 地图相关
const longitude = ref(109.191242);
const latitude = ref(27.718245);
const calledCount = ref(0); // 从0开始，更合理

const markers = ref([
  {
    id: 1,
    longitude: 109.191242,
    latitude: 27.718245,
    iconPath: "/static/location-pin.png", // 确保有这个图标
    width: 30,
    height: 30,
    callout: {
      content: "", // 气泡内容已移至外部
      display: "ALWAYS",
    },
  },
]);

// 订单信息
const orderInfo = reactive({
  address: "铜仁市碧江区早到日货市场",
  price: "16.00",
  notes: "",
});

// 编辑弹窗
const showEditPopup = ref(false);
const editPopupData = reactive({
  type: "", // address, price, notes
  title: "",
  placeholder: "",
  value: "",
});

// 取消订单确认弹窗
const showCancelOrderConfirm = ref(false);

// 长时间等待提示弹窗
const showLongWaitTip = ref(false);
const technicianAccepted = ref(false); // 新增：标记师傅是否已接单，避免长时间等待弹窗冲突

// 定时器引用
let callTimer = null;
let statusTimer = null; // 模拟接单定时器
let longWaitTimer = null; // 长时间等待计时器

// --- 计算属性 ---
const callStatusMessage = computed(() => {
  if (calledCount.value === 0) {
    return "正在搜索附近师傅...";
  } else if (calledCount.value < MAX_CALLED_COUNT) {
    return `已通知 ${calledCount.value} 位师傅`;
  } else {
    return `已通知所有可接单师傅`;
  }
});

const currentStatusTitle = computed(() => {
  // 可以在这里根据订单状态动态改变标题
  return "正在呼叫附近师傅";
});

const currentStatusDesc = computed(() => {
  // 可以在这里根据订单状态动态改变描述
  return "90%的订单在2分钟内有应答，请等待...";
});

// --- 方法 ---

// 开始呼叫师傅
const startCalling = () => {
  callTimer = setInterval(() => {
    if (calledCount.value < MAX_CALLED_COUNT) {
      calledCount.value++;
    } else {
      clearInterval(callTimer);
      callTimer = null;
    }
  }, CALL_INTERVAL);
};

// 开始状态检查 (模拟师傅接单)
const startStatusCheck = () => {
  statusTimer = setTimeout(() => {
    onTechnicianAccepted();
  }, ACCEPT_ORDER_DELAY);
};

// 启动长时间等待监控
const startLongWaitMonitor = () => {
  longWaitTimer = setTimeout(() => {
    if (!technicianAccepted.value) {
      showLongWaitTip.value = true;
    }
  }, LONG_WAIT_THRESHOLD);
};

// 师傅接单
const onTechnicianAccepted = () => {
  clearTimers(); // 清除所有计时器
  technicianAccepted.value = true; // 设置标志位

  uni.showToast({
    title: "师傅已接单",
    icon: "success",
  });

  setTimeout(() => {
    uni.redirectTo({
      url: "/pages/technician-info/technician-info", // 假设有这个页面
    });
  }, 1500);
};

// 清除定时器
const clearTimers = () => {
  if (callTimer) {
    clearInterval(callTimer);
    callTimer = null;
  }
  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }
  if (longWaitTimer) {
    clearTimeout(longWaitTimer);
    longWaitTimer = null;
  }
};

// 定位到中心
// const centerToLocation = () => {
//   const mapContext = uni.createMapContext("map");
//   mapContext.moveToLocation({
//     longitude: longitude.value,
//     latitude: latitude.value,
//   });
// };

// 地图标记点击
const onMarkerTap = (e) => {
  console.log("marker tap", e);
  // 可以显示订单详情或地址信息等
};

// 统一编辑入口
const editItem = (type) => {
  editPopupData.type = type;
  switch (type) {
    case "address":
      editPopupData.title = "修改地址";
      editPopupData.placeholder = "请输入地址";
      editPopupData.value = orderInfo.address;
      editPopupData.type = "text";
      break;
    case "price":
      editPopupData.title = "修改金额";
      editPopupData.placeholder = "请输入金额";
      editPopupData.value = orderInfo.price;
      editPopupData.type = "digit"; // 金额使用数字键盘
      break;
    case "notes":
      editPopupData.title = "订单备注";
      editPopupData.placeholder = "请输入备注";
      editPopupData.value = orderInfo.notes;
      editPopupData.type = "textarea"; // 备注可以使用多行文本
      break;
  }
  showEditPopup.value = true;
};

// 关闭编辑弹窗
const closeEditPopup = () => {
  showEditPopup.value = false;
};

// 确认编辑
const confirmEdit = () => {
  const { type, value } = editPopupData;

  if (type === "address") {
    orderInfo.address = value;
  } else if (type === "price") {
    // 简单校验金额
    if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
      uni.showToast({
        title: "请输入有效金额",
        icon: "none",
      });
      return;
    }
    orderInfo.price = parseFloat(value).toFixed(2); // 格式化为两位小数
  } else if (type === "notes") {
    orderInfo.notes = value;
  }

  showEditPopup.value = false;

  uni.showToast({
    title: "修改成功",
    icon: "success",
  });
};

// 取消订单
const cancelOrder = () => {
  showCancelOrderConfirm.value = false;
  clearTimers(); // 取消订单后，清除所有计时器

  uni.showToast({
    title: "订单已取消",
    icon: "none",
  });
  // 实际应用中，这里会调用API取消订单，并跳转到订单列表或首页
  setTimeout(() => {
    uni.navigateBack(); // 返回上一页或跳转到首页
  }, 1000);
};

// 长时间等待后的操作
const increasePrice = () => {
  showLongWaitTip.value = false;
  uni.showToast({
    title: "前往加价页面",
    icon: "none",
  });
  // 模拟加价后重新开始呼叫流程
  calledCount.value = 0;
  technicianAccepted.value = false; // 重置接单状态
  clearTimers();
  startCalling();
  startStatusCheck();
  startLongWaitMonitor();
};

const republishOrder = () => {
  showLongWaitTip.value = false;
  uni.showToast({
    title: "订单已重新发布",
    icon: "success",
  });
  // 模拟重新发布订单，重置状态
  calledCount.value = 0;
  technicianAccepted.value = false; // 重置接单状态
  clearTimers();
  startCalling();
  startStatusCheck();
  startLongWaitMonitor();
};

const contactCustomerService = () => {
  showLongWaitTip.value = false;
  uni.makePhoneCall({
    phoneNumber: "10086", // 模拟客服电话
  });
};

// --- 生命周期钩子 ---
onMounted(() => {
  startCalling();
  startStatusCheck();
  startLongWaitMonitor(); // 启动长时间等待监控
});

onUnmounted(() => {
  clearTimers();
});
</script>

<style lang="scss" scoped>
.waiting-page {
  height: 100vh;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 地图容器 */
.map-container {
  position: relative;
  flex: 1; /* 让地图占据剩余空间，而不是固定高度 */
  min-height: 300px; /* 最小高度，防止内容过多时地图过小 */

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
      animation: pulse 1.5s infinite ease-in-out; /* 增加动画效果 */
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
  display: flex; /* 使用flex布局 */
  flex-direction: column;
  align-items: center; /* 居中内容 */
  gap: 12px; /* 增加间距 */

  .status-header {
    display: flex;
    align-items: center;
    gap: 8px;
    // margin-bottom: 8px; /* 移除这个，由gap控制 */

    .status-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .status-desc {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
    text-align: center; /* 文本居中 */
  }

  .cancel-btn {
    margin-top: 12px;
    width: 100%; /* 让按钮宽度与卡片对齐 */
    border-radius: 8px; /* 按钮圆角 */
    background-color: #ff4d4f; /* 警告色 */
    color: #fff;
    border: none; /* 移除边框 */
    &:active {
      opacity: 0.8;
    }
  }
}

/* 订单信息 */
.order-info {
  padding: 0 16px 20px; /* 底部留白，确保内容不会被底部安全区遮挡 */
  background: #fff;
  flex-shrink: 0; /* 确保不被压缩 */

  .info-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    position: relative; // 相对定位

    &:last-child {
      border-bottom: none;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      // border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      // margin-right: 12px;
      flex-shrink: 0; // 防止图标被压缩
      font-size: 46rpx;
      &.location-icon {
        // background: rgba(82, 196, 26, 0.1);
        .icon-dingwei-shifuduan {
          color: $color-success;
          font-size: inherit;
        }
      }

      &.price-icon {
        // background: rgba(250, 173, 20, 0.1);
        .image {
          width: 46rpx;
          height: 46rpx;
        }
      }

      &.notes-icon {
        // background: rgba(24, 144, 255, 0.1);
      }
    }

    .info-text {
      flex: 1;
      color: #333;
      font-size: 16px;
      line-height: 1.5;
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
        word-break: break-all; // 防止长文本溢出
      }

      .info-placeholder {
        color: #999;
        font-size: 16px;
      }
    }

    .edit-text {
      color: #1890ff; // 蓝色文字更醒目
      font-size: 14px;
      margin-left: 12px;
      padding: 4px 8px; // 增加点击区域
      border-radius: 4px;
      // background: rgba(24, 144, 255, 0.08); // 增加背景色
      &:active {
        opacity: 0.7; // 点击反馈
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

/* 取消订单确认弹窗 */
.cancel-confirm-popup {
  width: 80%; /* 弹窗宽度 */
  border-radius: 12px;
  overflow: hidden;

  .cancel-popup-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cancel-popup-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin-bottom: 10px;
  }

  .cancel-popup-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .cancel-popup-buttons {
    display: flex;
    gap: 15px;
    width: 100%;
    justify-content: center;
  }
}

/* 长时间等待提示弹窗 */
.long-wait-popup {
  width: 80%; /* 弹窗宽度 */
  border-radius: 12px;
  overflow: hidden;

  .long-wait-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .long-wait-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin-bottom: 10px;
  }

  .long-wait-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .long-wait-btn {
    margin-top: 10px;
    width: 100%;
  }
}

/* 气泡动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
