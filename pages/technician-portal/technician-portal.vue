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

    <!-- 订单列表 - 使用z-paging -->
    <z-paging
      ref="paging"
      v-model="dataList"
      :refresher-enabled="true"
      :auto="true"
      :fixed="false"
      :safe-area-inset-bottom="false"
      :lower-threshold="50"
      empty-view-text="暂无订单数据"
      empty-view-img="/static/empty-order.png"
      :empty-view-style="{ paddingTop: '100px' }"
      :refresher-threshold="80"
      refresher-default-text="下拉刷新订单"
      refresher-pulling-text="释放刷新订单"
      refresher-refreshing-text="正在刷新..."
      loading-more-default-text="上拉加载更多订单"
      loading-more-loading-text="加载中..."
      loading-more-no-more-text="没有更多订单了"
      :auto-show-system-loading="true"
      @query="queryList"
    >
      <view class="orders-container">
        <!-- 新任务列表 -->
        <view v-if="activeTab === 'new'">
          <view v-for="order in dataList" :key="order.id" class="order-card">
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
            v-for="order in dataList"
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
            v-for="order in dataList"
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
      </view>
    </z-paging>

    <!-- 底部上线按钮 -->
    <safe-area-footer :fixed="true">
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
    </safe-area-footer>

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
      dataList: [], // z-paging的数据列表

      // 模拟数据源
      mockData: {
        new: [
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
          {
            id: 3,
            serviceName: "洗衣机维修",
            price: "120.00",
            timeLimit: "1小时内上门",
            address: "铜仁市万山区茶店街道办事处",
            notes: "洗衣机不转动，需要检查",
            grabbing: false,
          },
          {
            id: 4,
            serviceName: "电视维修",
            price: "80.00",
            timeLimit: "2小时内上门",
            address: "铜仁市碧江区人民路123号",
            notes: "电视无法开机",
            grabbing: false,
          },
          {
            id: 5,
            serviceName: "热水器维修",
            price: "150.00",
            timeLimit: "30分钟内上门",
            address: "铜仁市碧江区南长城路鞋区a2栋",
            notes: "热水器不加热",
            grabbing: false,
          },
        ],
        serving: [
          {
            id: 101,
            serviceName: "冰箱维修",
            customerName: "张先生",
            customerPhone: "138****8888",
            address: "铜仁市碧江区人民路123号",
            notes: "冰箱不制冷，已上门检查",
          },
          {
            id: 102,
            serviceName: "微波炉维修",
            customerName: "李女士",
            customerPhone: "139****9999",
            address: "铜仁市万山区茶店街道办事处",
            notes: "微波炉不加热，正在维修中",
          },
        ],
        pending: [
          {
            id: 201,
            serviceName: "洗衣机维修",
            appointmentTime: "今天 14:00",
            address: "铜仁市万山区茶店街道办事处",
            notes: "洗衣机不转动，预约下午维修",
            customerName: "王先生",
            customerPhone: "137****7777",
          },
          {
            id: 202,
            serviceName: "油烟机清洗",
            appointmentTime: "明天 09:00",
            address: "铜仁市碧江区南长城路鞋区a2栋",
            notes: "油烟机需要深度清洗",
            customerName: "赵女士",
            customerPhone: "136****6666",
          },
        ],
      },
    };
  },

  methods: {
    // z-paging查询数据的方法
    queryList(pageNo, pageSize) {
      // 模拟网络请求延迟
      setTimeout(() => {
        const currentData = this.mockData[this.activeTab] || [];

        // 模拟分页数据
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = currentData.slice(startIndex, endIndex);

        // 模拟总数据量，用于判断是否还有更多数据
        // const total = currentData.length + (pageNo < 3 ? 10 : 0); // 模拟有更多数据

        if (pageNo === 1) {
          // 第一页或刷新时，直接赋值
          this.$refs.paging.complete(pageData);
        } else {
          // 加载更多时，追加数据
          if (pageData.length > 0) {
            this.$refs.paging.complete(pageData);
          } else {
            // 没有更多数据
            this.$refs.paging.complete(false);
          }
        }
      }, 1000); // 模拟1秒的网络延迟
    },

    // 切换标签
    switchTab(tab) {
      if (this.activeTab === tab) return;

      this.activeTab = tab;
      // 切换标签时重新加载数据
      this.$refs.paging.reload();
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

        // 从当前列表中移除该订单
        const orderIndex = this.dataList.findIndex((o) => o.id === order.id);
        if (orderIndex > -1) {
          this.dataList.splice(orderIndex, 1);
        }

        // 将订单添加到待服务列表（实际项目中应该通过接口同步）
        this.mockData.pending.unshift({
          ...order,
          appointmentTime: "立即服务",
          customerName: "李女士",
          customerPhone: "139****9999",
        });
      }, 2000);
    },

    // 开始服务
    startService(order) {
      uni.showModal({
        title: "确认开始服务",
        content: "确定要开始为客户提供服务吗？",
        success: (res) => {
          if (res.confirm) {
            // 从当前列表中移除该订单
            const orderIndex = this.dataList.findIndex(
              (o) => o.id === order.id,
            );
            if (orderIndex > -1) {
              this.dataList.splice(orderIndex, 1);
            }

            // 将订单添加到服务中列表
            this.mockData.serving.unshift(order);

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
            // 从当前列表中移除该订单
            const orderIndex = this.dataList.findIndex(
              (o) => o.id === order.id,
            );
            if (orderIndex > -1) {
              this.dataList.splice(orderIndex, 1);
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

      // 上线后刷新订单列表
      if (this.isOnline) {
        this.$refs.paging.reload();
      }
    },

    // 获取上线按钮样式
    getOnlineButtonStyle() {
      return this.isOnline
        ? "background: #52c41a; border-radius: 8px; font-size: 18px; font-weight: 500;"
        : "background: #1890ff; border-radius: 8px; font-size: 18px; font-weight: 500;";
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

/* 订单容器 */
.orders-container {
  padding: 16px;
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

/* 底部操作区域 */
.bottom-actions {
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
