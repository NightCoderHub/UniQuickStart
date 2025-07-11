<template>
  <view class="appointment-page">
    <view class="content-wrapper">
      <view class="technician-info-card">
        <image
          :src="technician.avatar || '/static/default_avator.png'"
          class="technician-avatar"
        ></image>
        <view class="details">
          <view class="name-rating">
            <text class="name">{{ technician.name }}</text>
            <text class="rating">{{ technician.rating }}分</text>
          </view>
          <view class="stats">
            <text>已服务：{{ technician.serviceCount }}+单</text>
            <text class="type-tag">{{ technician.type }}</text>
          </view>
          <view class="service-tags">
            <wd-tag
              v-for="service in technician.services"
              :key="service"
              type="primary"
              size="mini"
              plain
              class="service-tag"
            >
              {{ service }}
            </wd-tag>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">选择服务项目</view>
        <wd-radio-group v-model="selectedServiceId">
          <view
            v-for="service in technician.availableServices"
            :key="service.id"
            class="service-item"
          >
            <wd-radio
              :value="service.id"
              :label="service.name"
              custom-class="service-radio"
            >
              <view class="service-details">
                <text class="service-name">{{ service.name }}</text>
                <text class="service-price"
                  >￥{{ service.price.toFixed(2) }}</text
                >
              </view>
            </wd-radio>
          </view>
        </wd-radio-group>
      </view>

      <view class="section">
        <view class="section-title">选择上门时间</view>
        <wd-calendar
          v-model="selectedDate"
          type="date"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
        />
        <wd-picker
          v-model="selectedTime"
          :columns="availableTimeSlots"
          placeholder="请选择具体时间段"
          label-key="label"
          value-key="value"
          custom-class="time-picker"
          @confirm="onTimeConfirm"
        />
      </view>

      <view class="section">
        <view class="section-title">预约信息</view>
        <wd-input
          v-model="appointmentForm.address"
          label="服务地址"
          placeholder="请输入详细服务地址"
          clearable
          custom-class="appointment-input"
        />
        <wd-input
          v-model="appointmentForm.contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          clearable
          custom-class="appointment-input"
        />
        <wd-input
          v-model="appointmentForm.contactPhone"
          label="联系电话"
          placeholder="请输入联系电话"
          type="number"
          clearable
          custom-class="appointment-input"
        />
        <wd-textarea
          v-model="appointmentForm.notes"
          label="备注"
          placeholder="可填写您的具体需求或问题（选填）"
          maxlength="200"
          show-word-limit
          autosize
          custom-class="appointment-textarea"
        />
      </view>

      <view class="order-summary-footer">
        <view class="total-price">
          <text>总计:</text>
          <text class="price-value">￥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <wd-button type="success" block @click="confirmAppointment">
          立即预约
        </wd-button>
      </view>
    </view>
    <wd-message-box />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMessage } from "wot-design-uni";

const message = useMessage();
// 模拟数据 (实际应用中会从后端接口获取)
const mockTechnicians = [
  {
    id: 1,
    name: "兰菊清",
    rating: 4.8,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    type: "家电维修",
    services: ["冰箱维修", "彩电维修", "空调安装"],
    availableServices: [
      { id: "service_1", name: "冰箱维修", price: 80.0, duration: 60 },
      { id: "service_2", name: "彩电维修", price: 75.0, duration: 50 },
      { id: "service_3", name: "空调安装", price: 120.0, duration: 90 },
    ],
    // 模拟可预约时间段
    timeSlots: {
      "2025-07-11": [
        { label: "10:00-11:00", value: "10:00-11:00" },
        { label: "14:00-15:00", value: "14:00-15:00" },
      ],
      "2025-07-12": [
        { label: "09:00-10:00", value: "09:00-10:00" },
        { label: "13:00-14:00", value: "13:00-14:00" },
        { label: "16:00-17:00", value: "16:00-17:00" },
      ],
    },
  },
  {
    id: 2,
    name: "吴明山",
    rating: 4.7,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    type: "综合服务",
    services: ["冰箱维修", "彩电维修", "搬家服务"],
    availableServices: [
      { id: "service_4", name: "搬家服务", price: 300.0, duration: 180 },
      { id: "service_5", name: "管道疏通", price: 50.0, duration: 45 },
    ],
    timeSlots: {
      "2025-07-11": [
        { label: "11:00-12:00", value: "11:00-12:00" },
        { label: "15:00-16:00", value: "15:00-16:00" },
      ],
      "2025-07-13": [
        { label: "09:30-10:30", value: "09:30-10:30" },
        { label: "14:30-15:30", value: "14:30-15:30" },
      ],
    },
  },
  // 更多技师数据...
];

const technician = ref({});
const selectedServiceId = ref("");
const selectedDate = ref(new Date()); // 默认选中今天
const selectedTime = ref("");
const availableTimeSlots = ref([]);

const appointmentForm = ref({
  address: "",
  contactName: "",
  contactPhone: "",
  notes: "",
});

// 计算属性
const selectedService = computed(() => {
  return technician.value.availableServices?.find(
    (s) => s.id === selectedServiceId.value,
  );
});

const totalPrice = computed(() => {
  return selectedService.value ? selectedService.value.price : 0;
});

// canSubmit 已移除

// 日期限制
const minDate = ref(new Date());
const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 1))); // 最多选择一个月后的日期

// 页面加载生命周期
onLoad(() => {
  // 直接加载第一个模拟技师
  if (mockTechnicians.length > 0) {
    technician.value = mockTechnicians[0];
    // 初始化技师的可预约服务，默认选中第一个
    if (
      technician.value.availableServices &&
      technician.value.availableServices.length > 0
    ) {
      selectedServiceId.value = technician.value.availableServices[0].id;
    }
    // 根据初始日期加载时间段
    updateAvailableTimeSlots(selectedDate.value);
  } else {
    uni.showToast({ title: "没有可用的技师信息", icon: "none" });
  }
});

const onDateConfirm = (event) => {
  const date = event.value;
  selectedDate.value = new Date(date);
  selectedTime.value = ""; // 日期改变，清空已选时间
  updateAvailableTimeSlots(selectedDate.value);
};

const onTimeConfirm = (event) => {
  selectedTime.value = event.value;
};

// 根据选择的日期更新可用时间段
const updateAvailableTimeSlots = (date) => {
  const dateString = formatDate(date); // 格式化日期为 YYYY-MM-DD
  availableTimeSlots.value = technician.value.timeSlots?.[dateString] || [];
  if (availableTimeSlots.value.length === 0) {
    uni.showToast({ title: "该日期暂无可用时间段", icon: "none" });
  }
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const confirmAppointment = () => {
  // 1. 必填项校验
  if (!selectedServiceId.value) {
    uni.showToast({ title: "请选择服务项目", icon: "none" });
    return;
  }
  if (!selectedDate.value) {
    uni.showToast({ title: "请选择上门日期", icon: "none" });
    return;
  }
  if (!selectedTime.value) {
    uni.showToast({ title: "请选择具体上门时间段", icon: "none" });
    return;
  }
  if (!appointmentForm.value.address) {
    uni.showToast({ title: "请输入服务地址", icon: "none" });
    return;
  }
  if (!appointmentForm.value.contactName) {
    uni.showToast({ title: "请输入联系人姓名", icon: "none" });
    return;
  }
  if (!appointmentForm.value.contactPhone) {
    uni.showToast({ title: "请输入联系电话", icon: "none" });
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(appointmentForm.value.contactPhone)) {
    uni.showToast({ title: "请输入有效的手机号", icon: "none" });
    return;
  }

  // 所有必填项都已填写，继续后续逻辑
  message
    .confirm({
      title: "确认预约",
      msg: `您即将预约 ${technician.value.name} 提供 ${selectedService.value.name} 服务，\n时间：${formatDate(selectedDate.value)} ${selectedTime.value}，\n总计：￥${totalPrice.value.toFixed(2)}。`,
    })
    .then(() => {
      // 用户点击了确定按钮
      console.log("点击了确定按钮");

      // 实际应用中：发送预约请求到后端
      console.log("预约信息:", {
        technicianId: technician.value.id,
        serviceId: selectedServiceId.value,
        appointmentDate: formatDate(selectedDate.value),
        appointmentTime: selectedTime.value,
        address: appointmentForm.value.address,
        contactName: appointmentForm.value.contactName,
        contactPhone: appointmentForm.value.contactPhone,
        notes: appointmentForm.value.notes,
        totalPrice: totalPrice.value,
      });

      uni.showToast({ title: "预约成功！", icon: "success" });
      // 预约成功后可以跳转到订单详情页或个人中心
      setTimeout(() => {
        uni.navigateBack(); // 返回上一页
      }, 1500);
    })
    .catch(() => {
      // 用户点击了取消按钮或消息框被关闭时
      console.log("预约已取消或消息框关闭");
    });
};
</script>

<style lang="scss" scoped>
.appointment-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom); // 适配底部安全区
}

.content-wrapper {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px; // 留出底部操作区域的高度
}

.technician-info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .technician-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .details {
    flex: 1;

    .name-rating {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .name {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-right: 8px;
      }

      .rating {
        font-size: 14px;
        color: #ff8c00;
      }
    }

    .stats {
      font-size: 13px;
      color: #666;
      margin-bottom: 6px;
      display: flex;
      align-items: center;

      .type-tag {
        background-color: #e6f7d9;
        color: #52c41a;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-left: 10px;
      }
    }

    .service-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      .service-tag {
        font-size: 12px;
      }
    }
  }
}

.section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .service-radio {
      flex: 1;
      .service-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .service-name {
        font-size: 15px;
        color: #333;
        margin-right: 10px;
      }
      .service-price {
        font-size: 15px;
        color: #ff5722;
        font-weight: 500;
      }
    }
  }

  .time-picker {
    margin-top: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
  }
}

.order-summary-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));

  .total-price {
    display: flex;
    align-items: baseline;
    font-size: 16px;
    color: #333;

    .price-value {
      font-size: 22px;
      color: #ff5722;
      font-weight: bold;
      margin-left: 8px;
    }
  }

  .wd-button {
    width: 150px;
  }
}
</style>
