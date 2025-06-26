<template>
  <view class="technician-list">
    <!-- 头部区域 -->
    <view class="header">
      <view class="location-selector" @click="selectLocation">
        <wd-icon name="location" color="#52c41a" size="20px"></wd-icon>
        <text class="location-text">铜仁</text>
        <wd-icon name="arrow-down" size="16px" color="#666"></wd-icon>
      </view>
      <view class="header-actions">
        <wd-icon name="more-horizontal" size="24px"></wd-icon>
        <wd-icon name="target" size="24px"></wd-icon>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <wd-icon name="search" size="20px" color="#999"></wd-icon>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="输入服务人员名称"
          @input="onSearch"
        />
      </view>
      <view class="search-actions">
        <wd-icon name="scan" size="24px" color="#666"></wd-icon>
        <view class="ai-button">
          <text class="ai-text">AI</text>
        </view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        class="filter-tab"
        :class="{ active: activeFilter === 'distance' }"
        @click="setActiveFilter('distance')"
      >
        <text class="tab-text">距离</text>
      </view>
      <view
        class="filter-tab"
        :class="{ active: activeFilter === 'rating' }"
        @click="setActiveFilter('rating')"
      >
        <text class="tab-text">评分</text>
      </view>
      <view
        class="filter-tab"
        :class="{ active: activeFilter === 'type' }"
        @click="setActiveFilter('type')"
      >
        <text class="tab-text">师傅类型</text>
      </view>
      <view class="filter-more" @click="showFilterPopup">
        <text class="filter-text">筛选</text>
        <wd-icon name="arrow-down" size="14px" color="#666"></wd-icon>
      </view>
    </view>

    <!-- 技师列表 -->
    <scroll-view class="technician-scroll" scroll-y>
      <view
        v-for="technician in filteredTechnicians"
        :key="technician.id"
        class="technician-item"
      >
        <view class="technician-card">
          <view class="technician-info">
            <image
              src="/static/default_avator.png"
              class="technician-avatar"
            ></image>

            <view class="technician-details">
              <view class="technician-header">
                <wd-tag type="success" size="mini">快速上门</wd-tag>
                <text class="technician-name">{{ technician.name }}</text>
                <text class="technician-rating">{{ technician.rating }}分</text>
              </view>

              <view class="technician-stats">
                <text class="stats-text"
                  >已服务：{{ technician.serviceCount }}+单</text
                >
              </view>

              <view class="availability">
                <wd-tag type="warning" size="mini" :plain="true"
                  >最早可约</wd-tag
                >
                <text class="available-time">{{
                  technician.availableTime
                }}</text>
              </view>

              <view class="service-tags">
                <wd-tag
                  v-for="service in technician.services"
                  :key="service"
                  type="primary"
                  size="mini"
                  :plain="true"
                  class="service-tag"
                >
                  {{ service }}
                </wd-tag>
              </view>
            </view>

            <view class="technician-actions">
              <text class="distance-text">距离{{ technician.distance }}</text>
              <wd-button
                type="success"
                size="small"
                class="appointment-btn"
                @click="makeAppointment(technician)"
              >
                去预约
              </wd-button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view
        class="nav-item"
        :class="{ active: activeTab === 'home' }"
        @click="switchTab('home')"
      >
        <wd-icon
          name="home"
          size="24px"
          :color="activeTab === 'home' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'home' }"
          >首页</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'expert' }"
        @click="switchTab('expert')"
      >
        <wd-icon
          name="user"
          size="24px"
          :color="activeTab === 'expert' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'expert' }"
          >专家</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'nearby' }"
        @click="switchTab('nearby')"
      >
        <wd-icon
          name="location"
          size="24px"
          :color="activeTab === 'nearby' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'nearby' }"
          >附近</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'profile' }"
        @click="switchTab('profile')"
      >
        <wd-icon
          name="user-circle"
          size="24px"
          :color="activeTab === 'profile' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'profile' }"
          >我的</text
        >
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <wd-popup v-model="showFilter" position="top" :close-on-click-modal="true">
      <view class="filter-popup">
        <view class="filter-content">
          <text class="filter-title">筛选条件</text>
          <!-- 筛选内容 -->
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: "",
      activeFilter: "distance",
      activeTab: "expert",
      showFilter: false,

      technicians: [
        {
          id: 1,
          name: "兰菊清",
          rating: 4.8,
          avatar: "/static/technician1.png",
          serviceCount: 20,
          availableTime: "12:00",
          distance: "0.31km",
          services: ["冰箱维修", "彩电维修"],
        },
        {
          id: 2,
          name: "吴明山",
          rating: 4.7,
          avatar: "/static/technician2.png",
          serviceCount: 20,
          availableTime: "12:00",
          distance: "1.01km",
          services: ["冰箱维修", "彩电维修", "搬家服务"],
        },
        {
          id: 3,
          name: "李旺旺",
          rating: 4.8,
          avatar: "/static/technician3.png",
          serviceCount: 20,
          availableTime: "12:00",
          distance: "1.15km",
          services: ["冰箱维修", "彩电维修", "水电修装"],
        },
        {
          id: 4,
          name: "陈晓源",
          rating: 5.0,
          avatar: "/static/technician4.png",
          serviceCount: 20,
          availableTime: "12:00",
          distance: "2.71km",
          services: ["冰箱维修", "彩电维修"],
        },
        {
          id: 5,
          name: "杨清远",
          rating: 4.6,
          avatar: "/static/technician5.png",
          serviceCount: 20,
          availableTime: "12:00",
          distance: "3.08km",
          services: ["冰箱维修", "彩电维修"],
        },
      ],
    };
  },

  computed: {
    filteredTechnicians() {
      let result = [...this.technicians];

      // 搜索过滤
      if (this.searchKeyword) {
        result = result.filter(
          (tech) =>
            tech.name.includes(this.searchKeyword) ||
            tech.services.some((service) =>
              service.includes(this.searchKeyword),
            ),
        );
      }

      // 排序
      if (this.activeFilter === "distance") {
        result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      } else if (this.activeFilter === "rating") {
        result.sort((a, b) => b.rating - a.rating);
      }

      return result;
    },
  },

  methods: {
    // 选择位置
    selectLocation() {
      console.log("选择位置");
      // 显示位置选择器
    },

    // 搜索
    onSearch() {
      console.log("搜索:", this.searchKeyword);
    },

    // 设置筛选条件
    setActiveFilter(filter) {
      this.activeFilter = filter;
    },

    // 显示筛选弹窗
    showFilterPopup() {
      this.showFilter = true;
    },

    // 预约技师
    makeAppointment(technician) {
      console.log("预约技师:", technician.name);
      uni.navigateTo({
        url: `/pages/appointment/appointment?technicianId=${technician.id}`,
      });
    },

    // 切换底部标签
    switchTab(tab) {
      this.activeTab = tab;

      switch (tab) {
        case "home":
          uni.switchTab({
            url: "/pages/index/index",
          });
          break;
        case "expert":
          // 当前页面
          break;
        case "nearby":
          uni.switchTab({
            url: "/pages/nearby/nearby",
          });
          break;
        case "profile":
          uni.switchTab({
            url: "/pages/profile/profile",
          });
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.technician-list {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;

  .location-selector {
    display: flex;
    align-items: center;
    gap: 4px;

    .location-text {
      font-size: 16px;
      color: #333;
      margin: 0 4px;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

/* 搜索区域 */
.search-section {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 8px 12px;
    margin-right: 12px;

    .search-input {
      flex: 1;
      margin-left: 8px;
      font-size: 14px;
      border: none;
      background: transparent;
    }
  }

  .search-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .ai-button {
      width: 32px;
      height: 32px;
      background: #1890ff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      .ai-text {
        color: #fff;
        font-size: 12px;
        font-weight: bold;
      }
    }
  }
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  .filter-tab {
    margin-right: 32px;
    padding-bottom: 8px;
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
        left: 0;
        right: 0;
        height: 2px;
        background: #52c41a;
      }
    }

    .tab-text {
      font-size: 16px;
      color: #333;
    }
  }

  .filter-more {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;

    .filter-text {
      font-size: 14px;
      color: #666;
    }
  }
}

/* 技师列表 */
.technician-scroll {
  flex: 1;
  padding: 0 16px;
  box-sizing: border-box;
}

.technician-item {
  margin-bottom: 12px;

  .technician-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;

    .technician-info {
      display: flex;
      gap: 12px;

      .technician-avatar {
        flex-shrink: 0;
        width: 150rpx;
        height: 150rpx;
      }

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
            font-size: 16px;
          }

          .technician-rating {
            color: #ff8c00;
            font-size: 14px;
          }
        }

        .technician-stats {
          margin-bottom: 8px;

          .stats-text {
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
          flex-wrap: wrap;
          gap: 6px;

          .service-tag {
            margin-bottom: 4px;
          }
        }
      }

      .technician-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;

        .distance-text {
          color: #999;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .appointment-btn {
          border-radius: 20px;
          padding: 0 16px;
        }
      }
    }
  }
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .nav-text {
      font-size: 12px;
      color: #999;

      &.active {
        color: #52c41a;
      }
    }
  }
}

/* 筛选弹窗 */
.filter-popup {
  background: #fff;
  padding: 20px;

  .filter-content {
    .filter-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }
}
</style>
