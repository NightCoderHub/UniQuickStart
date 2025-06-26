<template>
  <view class="technician-portal">
    <!-- 标签导航 -->
    <view class="tab-navigation">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'new' }"
        @click="switchTab('new')"
      >
        <text class="tab-text">新任务</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'serving' }"
        @click="switchTab('serving')"
      >
        <text class="tab-text">服务中</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        <text class="tab-text">待服务</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="orders-scroll" scroll-y @scrolltolower="loadMore">
      <view class="orders-container">
        <!-- 新任务列表 -->
        <view v-if="activeTab === 'new'">
          <view v-for="order in newOrders" :key="order.id" class="order-card">
            <view class="order-header">
              <view class="service-type">
                <text class="service-name">{{ order.serviceName }}</text>
              </view>
              <text class="view-details" @click="viewOrderDetails(order)"
                >查看详情</text
              >
            </view>

            <view class="order-info">
              <view class="info-item">
                <wd-icon name="clock" color="#52c41a" size="16px"></wd-icon>
                <text class="info-text">{{ order.timeLimit }}</text>
              </view>

              <view class="price-section">
                <text class="price-amount">{{ order.price }}</text>
                <text class="price-unit">元</text>
              </view>
            </view>

            <view class="order-location">
              <wd-icon name="location" color="#1890ff" size="16px"></wd-icon>
              <text class="location-text">{{ order.address }}</text>
            </view>

            <view class="order-actions">
              <wd-button
                type="primary"
                size="large"
                block
                :loading="order.grabbing"
                custom-style="background: #1890ff; border-radius: 8px; font-size: 16px; font-weight: 500;"
                @click="grabOrder(order)"
              >
                {{ order.grabbing ? "抢单中..." : "抢单" }}
              </wd-button>
            </view>
          </view>
        </view>

        <!-- 服务中列表 -->
        <view v-if="activeTab === 'serving'">
          <view
            v-for="order in servingOrders"
            :key="order.id"
            class="order-card serving"
          >
            <view class="order-header">
              <view class="service-type">
                <text class="service-name">{{ order.serviceName }}</text>
              </view>
              <text class="view-details" @click="viewOrderDetails(order)"
                >查看详情</text
              >
            </view>

            <view class="order-info">
              <view class="info-item">
                <wd-icon name="user" color="#52c41a" size="16px"></wd-icon>
                <text class="info-text">{{ order.customerName }}</text>
              </view>

              <view class="service-status">
                <wd-tag type="warning" size="small">服务中</wd-tag>
              </view>
            </view>

            <view class="order-location">
              <wd-icon name="location" color="#1890ff" size="16px"></wd-icon>
              <text class="location-text">{{ order.address }}</text>
            </view>

            <view class="order-actions">
              <wd-button
                type="success"
                size="large"
                block
                custom-style="border-radius: 8px; font-size: 16px; font-weight: 500;"
                @click="completeService(order)"
              >
                完成服务
              </wd-button>
            </view>
          </view>
        </view>

        <!-- 待服务列表 -->
        <view v-if="activeTab === 'pending'">
          <view
            v-for="order in pendingOrders"
            :key="order.id"
            class="order-card pending"
          >
            <view class="order-header">
              <view class="service-type">
                <text class="service-name">{{ order.serviceName }}</text>
              </view>
              <text class="view-details" @click="viewOrderDetails(order)"
                >查看详情</text
              >
            </view>

            <view class="order-info">
              <view class="info-item">
                <wd-icon name="clock" color="#faad14" size="16px"></wd-icon>
                <text class="info-text"
                  >预约时间：{{ order.appointmentTime }}</text
                >
              </view>

              <view class="service-status">
                <wd-tag type="primary" size="small">待服务</wd-tag>
              </view>
            </view>

            <view class="order-location">
              <wd-icon name="location" color="#1890ff" size="16px"></wd-icon>
              <text class="location-text">{{ order.address }}</text>
            </view>

            <view class="order-actions">
              <wd-button
                type="primary"
                size="large"
                block
                custom-style="border-radius: 8px; font-size: 16px; font-weight: 500;"
                @click="startService(order)"
              >
                开始服务
              </wd-button>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="getCurrentOrders.length === 0" class="empty-state">
          <wd-icon name="inbox" size="64px" color="#d9d9d9"></wd-icon>
          <text class="empty-text">暂无{{ getTabName() }}订单</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部上线按钮 -->
    <view class="bottom-actions">
      <wd-button
        :type="isOnline ? 'success' : 'primary'"
        size="large"
        block
        :custom-style="getOnlineButtonStyle()"
        @click="toggleOnlineStatus"
      >
        {{ isOnline ? "已上线" : "上线" }}
      </wd-button>
    </view>

    <!-- 订单详情弹窗 -->
    <wd-popup
      v-model="showOrderDetail"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view v-if="selectedOrder" class="order-detail-popup">
        <view class="popup-header">
          <text class="popup-title">订单详情</text>
          <wd-icon name="close" size="24px" @click="closeOrderDetail"></wd-icon>
        </view>

        <view class="popup-content">
          <view class="detail-section">
            <text class="section-title">服务信息</text>
            <view class="detail-item">
              <text class="detail-label">服务类型：</text>
              <text class="detail-value">{{ selectedOrder.serviceName }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">服务价格：</text>
              <text class="detail-value price"
                >{{ selectedOrder.price }}元</text
              >
            </view>
            <view class="detail-item">
              <text class="detail-label">服务地址：</text>
              <text class="detail-value">{{ selectedOrder.address }}</text>
            </view>
          </view>

          <view v-if="selectedOrder.customerName" class="detail-section">
            <text class="section-title">客户信息</text>
            <view class="detail-item">
              <text class="detail-label">客户姓名：</text>
              <text class="detail-value">{{ selectedOrder.customerName }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">联系电话：</text>
              <text class="detail-value">{{
                selectedOrder.customerPhone
              }}</text>
            </view>
          </view>

          <view class="detail-section">
            <text class="section-title">订单备注</text>
            <text class="detail-notes">{{
              selectedOrder.notes || "无备注"
            }}</text>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: "new", // new, serving, pending
      isOnline: false,
      showOrderDetail: false,
      selectedOrder: null,

      // 新任务订单
      newOrders: [
        {
          id: 1,
          serviceName: "空调维修",
          price: "58.00",
          timeLimit: "36分钟内上门",
          address: "铜仁市碧江区早到日货市场",
          notes: "空调不制冷，需要检查维修",
          grabbing: false,
        },
        {
          id: 2,
          serviceName: "家务保姆",
          price: "299.00",
          timeLimit: "36分钟内上门",
          address: "铜仁市碧江区早到日货市场",
          notes: "需要打扫卫生，整理房间",
          grabbing: false,
        },
      ],

      // 服务中订单
      servingOrders: [
        {
          id: 3,
          serviceName: "冰箱维修",
          customerName: "张先生",
          customerPhone: "138****8888",
          address: "铜仁市碧江区人民路123号",
          notes: "冰箱不制冷，已上门检查",
        },
      ],

      // 待服务订单
      pendingOrders: [
        {
          id: 4,
          serviceName: "洗衣机维修",
          appointmentTime: "今天 14:00",
          address: "铜仁市万山区茶店街道办事处",
          notes: "洗衣机不转动，预约下午维修",
        },
      ],
    };
  },

  computed: {
    getCurrentOrders() {
      switch (this.activeTab) {
        case "new":
          return this.newOrders;
        case "serving":
          return this.servingOrders;
        case "pending":
          return this.pendingOrders;
        default:
          return [];
      }
    },
  },

  methods: {
    // 切换标签
    switchTab(tab) {
      this.activeTab = tab;
    },

    // 获取标签名称
    getTabName() {
      const tabNames = {
        new: "新任务",
        serving: "服务中",
        pending: "待服务",
      };
      return tabNames[this.activeTab] || "";
    },

    // 抢单
    grabOrder(order) {
      if (!this.isOnline) {
        uni.showToast({
          title: "请先上线",
          icon: "none",
        });
        return;
      }

      order.grabbing = true;

      // 模拟抢单请求
      setTimeout(() => {
        order.grabbing = false;

        // 模拟抢单成功
        uni.showToast({
          title: "抢单成功",
          icon: "success",
        });

        // 将订单移到待服务列表
        const orderIndex = this.newOrders.findIndex((o) => o.id === order.id);
        if (orderIndex > -1) {
          this.newOrders.splice(orderIndex, 1);
          this.pendingOrders.unshift({
            ...order,
            appointmentTime: "立即服务",
            customerName: "李女士",
            customerPhone: "139****9999",
          });
        }
      }, 2000);
    },

    // 开始服务
    startService(order) {
      uni.showModal({
        title: "确认开始服务",
        content: "确定要开始为客户提供服务吗？",
        success: (res) => {
          if (res.confirm) {
            // 将订单移到服务中列表
            const orderIndex = this.pendingOrders.findIndex(
              (o) => o.id === order.id,
            );
            if (orderIndex > -1) {
              this.pendingOrders.splice(orderIndex, 1);
              this.servingOrders.unshift(order);
              this.activeTab = "serving";
            }

            uni.showToast({
              title: "服务已开始",
              icon: "success",
            });
          }
        },
      });
    },

    // 完成服务
    completeService(order) {
      uni.showModal({
        title: "确认完成服务",
        content: "确定已完成服务吗？完成后将结算费用。",
        success: (res) => {
          if (res.confirm) {
            // 移除订单
            const orderIndex = this.servingOrders.findIndex(
              (o) => o.id === order.id,
            );
            if (orderIndex > -1) {
              this.servingOrders.splice(orderIndex, 1);
            }

            uni.showToast({
              title: "服务已完成",
              icon: "success",
            });

            // 跳转到评价页面或结算页面
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/service-complete/service-complete?orderId=${order.id}`,
              });
            }, 1500);
          }
        },
      });
    },

    // 查看订单详情
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.showOrderDetail = true;
    },

    // 关闭订单详情
    closeOrderDetail() {
      this.showOrderDetail = false;
      this.selectedOrder = null;
    },

    // 切换上线状态
    toggleOnlineStatus() {
      this.isOnline = !this.isOnline;

      uni.showToast({
        title: this.isOnline ? "已上线，可接收订单" : "已下线",
        icon: "success",
      });
    },

    // 获取上线按钮样式
    getOnlineButtonStyle() {
      return this.isOnline
        ? "background: #52c41a; border-radius: 8px; font-size: 18px; font-weight: 500;"
        : "background: #1890ff; border-radius: 8px; font-size: 18px; font-weight: 500;";
    },

    // 加载更多
    loadMore() {
      console.log("加载更多订单");
      // 实现加载更多逻辑
    },
  },
};
</script>

<style lang="scss" scoped>
.technician-portal {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 16px 0;
    position: relative;

    &.active {
      .tab-text {
        color: #52c41a;
        font-weight: 500;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 3px;
        background: #52c41a;
        border-radius: 2px;
      }
    }

    .tab-text {
      font-size: 16px;
      color: #666;
    }
  }
}

/* 订单滚动区域 */
.orders-scroll {
  flex: 1;
  padding: 0 16px 120px;
}

.orders-container {
  padding-top: 16px;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .service-type {
      background: rgba(82, 196, 26, 0.1);
      padding: 6px 12px;
      border-radius: 6px;

      .service-name {
        color: #52c41a;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .view-details {
      color: #999;
      font-size: 14px;
    }
  }

  .order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .info-text {
        color: #333;
        font-size: 14px;
      }
    }

    .price-section {
      display: flex;
      align-items: baseline;

      .price-amount {
        color: #ff4d4f;
        font-size: 20px;
        font-weight: bold;
      }

      .price-unit {
        color: #ff4d4f;
        font-size: 14px;
        margin-left: 2px;
      }
    }

    .service-status {
      // 服务状态样式
    }
  }

  .order-location {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;

    .location-text {
      color: #666;
      font-size: 14px;
      flex: 1;
    }
  }

  .order-actions {
    // 操作按钮区域
  }

  &.serving {
    border-left: 4px solid #faad14;
  }

  &.pending {
    border-left: 4px solid #1890ff;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .empty-text {
    color: #999;
    font-size: 14px;
    margin-top: 16px;
  }
}

/* 底部操作区域 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

/* 订单详情弹窗 */
.order-detail-popup {
  background: #fff;
  border-radius: 12px 12px 0 0;
  max-height: 70vh;

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
    padding: 16px;
    max-height: 50vh;
    overflow-y: auto;

    .detail-section {
      margin-bottom: 20px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;
        display: block;
      }

      .detail-item {
        display: flex;
        margin-bottom: 8px;

        .detail-label {
          color: #666;
          font-size: 14px;
          width: 80px;
          flex-shrink: 0;
        }

        .detail-value {
          color: #333;
          font-size: 14px;
          flex: 1;

          &.price {
            color: #ff4d4f;
            font-weight: 500;
          }
        }
      }

      .detail-notes {
        color: #666;
        font-size: 14px;
        line-height: 1.5;
        background: #f5f5f5;
        padding: 12px;
        border-radius: 6px;
      }
    }
  }
}
</style>
