<template>
  <view class="technician-info-page">
    <view class="map-container">
      <map
        id="technicianMap"
        :longitude="technicianLocation.longitude"
        :latitude="technicianLocation.latitude"
        :scale="14"
        :markers="mapMarkers"
        :polyline="polyline"
        class="map"
        show-location
      ></map>
      <cover-view class="current-status-bubble">
        <cover-view class="bubble-content">
          {{ currentStatusMessage }}
        </cover-view>
        <cover-view class="bubble-arrow"></cover-view>
      </cover-view>
      <!-- <cover-view class="center-btn" @click="centerMap">
        <wd-icon name="crosshairs-gps" size="24px" color="#666"></wd-icon>
      </cover-view> -->
    </view>

    <view class="technician-card">
      <view class="card-header">
        <image :src="technicianInfo.avatar" class="avatar"></image>
        <view class="info-details">
          <text class="name">{{ technicianInfo.name }}</text>
          <view class="rating">
            <wd-rate
              :model-value="technicianInfo.rating"
              readonly
              allow-half
              size="16px"
            ></wd-rate>
            <text class="rating-text"
              >({{ technicianInfo.rating.toFixed(1) }}分)</text
            >
          </view>
          <text class="license-plate">{{ technicianInfo.licensePlate }}</text>
        </view>
        <view class="actions">
          <wd-button icon="phone" size="small" @click="callTechnician"
            >呼叫</wd-button
          >
          <!-- <wd-button icon="chat" size="small" @click="chatWithTechnician">聊天</wd-button> -->
        </view>
      </view>

      <view class="card-body">
        <view class="status-timeline">
          <view class="timeline-item" :class="{ active: currentPhase >= 1 }">
            <view class="dot"></view>
            <text class="label">师傅已接单</text>
          </view>
          <view class="timeline-item" :class="{ active: currentPhase >= 2 }">
            <view class="dot"></view>
            <text class="label">师傅正赶来</text>
          </view>
          <view class="timeline-item" :class="{ active: currentPhase >= 3 }">
            <view class="dot"></view>
            <text class="label">师傅已抵达</text>
          </view>
        </view>
        <text class="estimated-arrival"
          >预计 {{ estimatedArrivalTime }} 抵达</text
        >
      </view>

      <view class="card-footer">
        <wd-button
          type="warning"
          block
          custom-class="cancel-btn"
          @click="showCancelOrderConfirm = true"
        >
          取消订单
        </wd-button>
      </view>
    </view>

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
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";

// 假设从上一页或全局状态获取的订单信息
const orderInfo = reactive({
  id: "ORDER123456",
  address: "铜仁市碧江区早到日货市场",
  userLocation: {
    longitude: 109.191242,
    latitude: 27.718245,
  },
  price: "16.00",
  notes: "",
});

// 模拟师傅信息
const technicianInfo = reactive({
  id: "TECH001",
  name: "张师傅",
  avatar: "/static/default_avator.png", // 示例头像
  rating: 4.8,
  licensePlate: "贵D·XXXXX",
  phone: "13888888888",
});

// 模拟师傅位置，并使其动态变化
const technicianLocation = reactive({
  longitude: 109.185, // 初始位置略微偏离用户
  latitude: 27.725,
});

// 用户当前位置
const userLocation = reactive({
  longitude: orderInfo.userLocation.longitude,
  latitude: orderInfo.userLocation.latitude,
});

// 模拟师傅和用户之间的路径（直线）
const polyline = ref([]);

// 模拟订单进度
const currentPhase = ref(1); // 1: 已接单, 2: 正赶来, 3: 已抵达
const estimatedArrivalTime = ref("00:00"); // 预计到达时间

// 取消订单确认弹窗
const showCancelOrderConfirm = ref(false);

// 定时器引用
let locationUpdateTimer = null; // 模拟师傅位置更新
let arrivalTimer = null; // 模拟到达时间

// --- 计算属性 ---
const mapMarkers = computed(() => {
  return [
    {
      id: 1,
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
      iconPath: "/static/location-pin.png", // 用户位置图标
      width: 30,
      height: 30,
      anchor: { x: 0.5, y: 1 }, // 锚点在底部中心
      callout: {
        content: "您的位置",
        display: "ALWAYS",
        padding: 5,
        borderRadius: 4,
        bgColor: "#fff",
        color: "#333",
      },
    },
    {
      id: 2,
      longitude: technicianLocation.longitude,
      latitude: technicianLocation.latitude,
      iconPath: "/static/technician-car.png", // 师傅车辆图标，需要替换为实际图标
      width: 40,
      height: 40,
      anchor: { x: 0.5, y: 0.5 }, // 锚点在中心
      rotate: 0, // 车辆方向
      callout: {
        content: `师傅 ${technicianInfo.name}\n${technicianInfo.licensePlate}`,
        display: "ALWAYS",
        padding: 5,
        borderRadius: 4,
        bgColor: "#fff",
        color: "#333",
        textAlign: "center",
      },
    },
  ];
});

const currentStatusMessage = computed(() => {
  if (currentPhase.value === 1) {
    return "师傅已接单，正准备出发";
  } else if (currentPhase.value === 2) {
    return `师傅正在赶来，预计还有 ${estimatedArrivalTime.value} 抵达`;
  } else if (currentPhase.value === 3) {
    return "师傅已抵达目的地附近";
  }
  return "订单状态更新中...";
});

// --- 方法 ---

// 居中地图
const centerMap = () => {
  // const mapContext = uni.createMapContext('technicianMap');
  // mapContext.moveToLocation({
  //   longitude: technicianLocation.longitude,
  //   latitude: technicianLocation.latitude,
  // });
  // 也可以同时包含用户位置，让地图显示两个点
  // mapContext.includePoints({
  //   points: [
  //     { longitude: userLocation.longitude, latitude: userLocation.latitude },
  //     { longitude: technicianLocation.longitude, latitude: technicianLocation.latitude },
  //   ],
  //   padding: [50, 50, 50, 50], // 上右下左边距
  // });
};

// 模拟师傅位置更新
const simulateTechnicianMovement = () => {
  let step = 0;
  const totalSteps = 60; // 模拟60秒内到达 (1分钟)
  const interval = 1000; // 每秒更新一次
  const startLong = technicianLocation.longitude;
  const startLat = technicianLocation.latitude;
  const endLong = userLocation.longitude;
  const endLat = userLocation.latitude;

  locationUpdateTimer = setInterval(() => {
    step++;
    if (step <= totalSteps) {
      // 线性插值计算新位置
      technicianLocation.longitude =
        startLong + (endLong - startLong) * (step / totalSteps);
      technicianLocation.latitude =
        startLat + (endLat - startLat) * (step / totalSteps);

      // 更新预计到达时间
      const remainingSeconds = totalSteps - step;
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      estimatedArrivalTime.value = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      // 更新路线
      updatePolyline();

      // 根据距离更新阶段
      const distance = getDistance(
        technicianLocation.latitude,
        technicianLocation.longitude,
        userLocation.latitude,
        userLocation.longitude,
      );
      if (distance < 50) {
        // 假设50米内算抵达
        currentPhase.value = 3; // 师傅已抵达
        clearInterval(locationUpdateTimer);
        clearInterval(arrivalTimer);
        estimatedArrivalTime.value = "已抵达";
      } else if (distance < 2000) {
        // 假设2公里内算赶来
        currentPhase.value = 2; // 师傅正赶来
      }
    } else {
      clearInterval(locationUpdateTimer);
      estimatedArrivalTime.value = "已抵达";
      currentPhase.value = 3;
    }
    // 每次更新位置后居中地图，确保用户能看到师傅的动态
    centerMap();
  }, interval);
};

// 更新两点之间的路线
const updatePolyline = () => {
  polyline.value = [
    {
      points: [
        {
          longitude: technicianLocation.longitude,
          latitude: technicianLocation.latitude,
        },
        { longitude: userLocation.longitude, latitude: userLocation.latitude },
      ],
      color: "#1890ff", // 路线颜色
      width: 4, // 路线宽度
      dottedLine: true, // 虚线
      arrowLine: true, // 箭头线
    },
  ];
};

// 计算两点间距离（简化版，仅供模拟，实际应使用更精确的地理计算或地图SDK）
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

// 模拟预计到达时间倒计时
const startArrivalCountdown = () => {
  let duration = 60; // 初始模拟60秒到达

  arrivalTimer = setInterval(() => {
    if (duration > 0) {
      duration--;
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      estimatedArrivalTime.value = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      clearInterval(arrivalTimer);
      estimatedArrivalTime.value = "已抵达";
      currentPhase.value = 3; // 理论上此时师傅也应该抵达了
    }
  }, 1000);
};

// 呼叫师傅
const callTechnician = () => {
  uni.makePhoneCall({
    phoneNumber: technicianInfo.phone,
  });
};

// 与师傅聊天
// const chatWithTechnician = () => {
//   uni.showToast({
//     title: "开发中",
//     icon: "none",
//   });
//   // 实际应用中会跳转到IM聊天界面
// };

// 取消订单
const cancelOrder = () => {
  showCancelOrderConfirm.value = false;
  uni.showLoading({ title: "正在取消订单..." });

  // 模拟 API 调用
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: "订单已取消",
      icon: "none",
    });
    // 清除所有定时器
    clearAllTimers();
    // 返回首页或订单列表
    uni.navigateBack(); // 或者 uni.reLaunch 到首页
  }, 1500);
};

// 清除所有定时器
const clearAllTimers = () => {
  if (locationUpdateTimer) {
    clearInterval(locationUpdateTimer);
    locationUpdateTimer = null;
  }
  if (arrivalTimer) {
    clearInterval(arrivalTimer);
    arrivalTimer = null;
  }
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 页面加载时，开始模拟师傅移动和倒计时
  simulateTechnicianMovement();
  startArrivalCountdown();
  updatePolyline(); // 初始化路线
  centerMap(); // 初始居中
});

onUnmounted(() => {
  // 页面卸载时清除所有定时器
  clearAllTimers();
});
</script>

<style lang="scss" scoped>
// 定义一些scss变量，方便统一管理颜色等
$color-primary: #1890ff; // 蓝色
$color-success: #52c41a; // 绿色
$color-warning: #faad14; // 黄色
$color-error: #ff4d4f; // 红色

.technician-info-page {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  min-height: 300px;

  .map {
    width: 100%;
    height: 100%;
  }

  .current-status-bubble {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;

    .bubble-content {
      background: $color-primary;
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .bubble-arrow {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid $color-primary;
      margin: 0 auto;
    }
  }

  .center-btn {
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

/* 师傅信息卡片 */
.technician-card {
  background: #fff;
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  flex-shrink: 0; // 防止被压缩

  .card-header {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 16px;
      background-color: #eee; // 占位符
    }

    .info-details {
      flex: 1;
      display: flex;
      flex-direction: column;

      .name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .rating {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        .rating-text {
          font-size: 14px;
          color: #666;
          margin-left: 6px;
        }
      }

      .license-plate {
        font-size: 14px;
        color: #999;
      }
    }

    .actions {
      display: flex;
      gap: 8px;

      wd-button {
        --wd-button-height: 32px; // 调整按钮高度
        --wd-button-font-size: 14px; // 调整按钮字体
      }
    }
  }

  .card-body {
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .status-timeline {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: 12px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        top: 8px;
        left: 10%;
        right: 10%;
        height: 2px;
        background-color: #e0e0e0;
        z-index: 0;
      }

      .timeline-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
        z-index: 1;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #e0e0e0;
          margin-bottom: 8px;
          transition: background-color 0.3s ease;
        }

        .label {
          font-size: 13px;
          color: #999;
          text-align: center;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        &.active {
          .dot {
            background-color: $color-success;
          }
          .label {
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    .estimated-arrival {
      font-size: 16px;
      color: $color-success;
      font-weight: 500;
      margin-top: 10px;
    }
  }

  .card-footer {
    padding-top: 16px;
    .cancel-btn {
      border-radius: 8px;
      background-color: $color-error;
      color: #fff;
      border: none;
    }
  }
}

/* 取消订单确认弹窗 (与waiting-page复用样式) */
.cancel-confirm-popup {
  width: 80%;
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
</style>
