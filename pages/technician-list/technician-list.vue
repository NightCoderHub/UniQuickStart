<template>
  <view class="technician-list">
    <z-paging
      ref="paging"
      use-virtual-list
      :force-close-inner-list="true"
      cell-height-mode="dynamic"
      :auto-show-back-to-top="true"
      :show-refresher-update-time="true"
      :empty-view-text="emptyViewText"
      :loading-text="loadingText"
      class="z-paging-technician-list"
      @virtual-list-change="virtualListChange"
      @query="queryList"
    >
      <template #top>
        <view class="header">
          <view class="location-selector" @click="selectLocation">
            <text class="iconfont icon-dingwei-shifuduan"> </text>
            <text class="location-text">铜仁</text>
            <wd-icon name="arrow-down" size="16px" color="#666"></wd-icon>
          </view>
          <view class="header-actions">
            <wd-icon name="more-horizontal" size="24px"></wd-icon>
            <wd-icon name="target" size="24px"></wd-icon>
          </view>
        </view>

        <search-section
          :is-enabled="true"
          @click="navigateToSearch"
        ></search-section>

        <view class="filter-tabs">
          <view
            class="filter-tab"
            :class="{ active: activeFilter === 'distance' }"
            @click="setSortFilter('distance')"
          >
            <text class="tab-text">距离</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: activeFilter === 'rating' }"
            @click="setSortFilter('rating')"
          >
            <text class="tab-text">评分</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: activeFilter === 'type' }"
            @click="showTechnicianTypeFilter"
          >
            <text class="tab-text">师傅类型</text>
            <wd-icon
              v-if="activeFilter !== 'type'"
              name="arrow-down"
              size="14px"
              color="#666"
            ></wd-icon>
            <wd-icon
              v-else
              name="arrow-up"
              size="14px"
              color="#52c41a"
            ></wd-icon>
          </view>
          <view class="filter-more" @click="showMoreFilterPopup">
            <text class="filter-text">筛选</text>
            <wd-icon name="arrow-down" size="12px" color="#666"></wd-icon>
          </view>
        </view>
      </template>

      <view
        v-for="technician in virtualTechnicians"
        :id="`zp-id-${technician.zp_index}`"
        :key="technician.zp_index"
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
    </z-paging>

    <wd-popup
      v-model="showTypeFilterPopup"
      position="bottom"
      :close-on-click-modal="true"
      @close="handleTypePopupClose"
    >
      <view class="type-filter-popup-content">
        <view
          class="type-option"
          :class="{ active: selectedTechnicianType === '' }"
          @click="selectTechnicianType('')"
        >
          全部师傅
          <wd-icon
            v-if="selectedTechnicianType === ''"
            name="check"
            color="#52c41a"
          ></wd-icon>
        </view>
        <view
          v-for="typeOption in technicianTypeOptions"
          :key="typeOption"
          class="type-option"
          :class="{ active: selectedTechnicianType === typeOption }"
          @click="selectTechnicianType(typeOption)"
        >
          {{ typeOption }}
          <wd-icon
            v-if="selectedTechnicianType === typeOption"
            name="check"
            color="#52c41a"
          ></wd-icon>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showMoreFilter"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view class="filter-popup">
        <view class="filter-content">
          <text class="filter-title">更多筛选</text>

          <view class="filter-section">
            <text class="section-title">服务范围</text>
            <view class="tag-group">
              <wd-tag
                v-for="scope in serviceScopeOptions"
                :key="scope.value"
                :type="
                  moreFilterConditions.serviceScope.includes(scope.value)
                    ? 'success'
                    : 'default'
                "
                :plain="
                  !moreFilterConditions.serviceScope.includes(scope.value)
                "
                size="large"
                class="filter-tag-item"
                @click="toggleServiceScope(scope.value)"
              >
                {{ scope.label }}
              </wd-tag>
            </view>
          </view>

          <view class="filter-section">
            <text class="section-title">可预约时间</text>
            <view class="tag-group">
              <wd-tag
                v-for="time in availabilityOptions"
                :key="time.value"
                :type="
                  moreFilterConditions.availability === time.value
                    ? 'success'
                    : 'default'
                "
                :plain="moreFilterConditions.availability !== time.value"
                size="large"
                class="filter-tag-item"
                @click="moreFilterConditions.availability = time.value"
              >
                {{ time.label }}
              </wd-tag>
            </view>
          </view>

          <view class="filter-section">
            <text class="section-title">技师性别</text>
            <view class="tag-group">
              <wd-tag
                v-for="gender in genderOptions"
                :key="gender.value"
                :type="
                  moreFilterConditions.gender === gender.value
                    ? 'success'
                    : 'default'
                "
                :plain="moreFilterConditions.gender !== gender.value"
                size="large"
                class="filter-tag-item"
                @click="moreFilterConditions.gender = gender.value"
              >
                {{ gender.label }}
              </wd-tag>
            </view>
          </view>

          <view class="popup-actions">
            <wd-button custom-class="action-btn" @click="resetMoreFilters"
              >重置</wd-button
            >
            <wd-button
              type="success"
              custom-class="action-btn confirm-btn"
              @click="applyMoreFilters"
              >确定</wd-button
            >
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
// The unnecessary import 'import zPaging from 'z-paging';' has been removed.

// 数据
const searchKeyword = ref("");
const activeFilter = ref("distance"); // 用于距离和评分的排序高亮
const virtualTechnicians = ref([]); // 用于虚拟列表渲染的数据源
const emptyViewText = ref("暂无相关技师");
const loadingText = ref("正在加载...");

// 师傅类型筛选相关
const showTypeFilterPopup = ref(false); // 控制师傅类型下拉弹窗的显示
const selectedTechnicianType = ref(""); // 存储当前选中的师傅类型
const technicianTypeOptions = ref([
  "家电维修",
  "水电安装",
  "管道疏通",
  "数码维修",
  "综合服务",
  "搬家服务",
]);

// 更多筛选相关 (原先的“筛选”按钮)
const showMoreFilter = ref(false); // 控制更多筛选弹窗的显示
const moreFilterConditions = ref({
  // 更多筛选的条件对象
  serviceScope: [], // 服务范围，多选
  availability: "", // 可预约时间，单选
  gender: "", // 技师性别，单选 ('male', 'female', '')
});

// Options for the new filters
const serviceScopeOptions = ref([
  { label: "上门维修", value: "on_site" },
  { label: "远程协助", value: "remote_help" },
  { label: "送修到店", value: "to_store" },
]);
const availabilityOptions = ref([
  { label: "立即上门", value: "immediate" },
  { label: "今天有空", value: "today" },
  { label: "明天有空", value: "tomorrow" },
  { label: "周末有空", value: "weekend" },
]);
const genderOptions = ref([
  { label: "男", value: "male" },
  { label: "女", value: "female" },
  { label: "不限", value: "" }, // '不限'选项
]);

// 获取 z-paging 实例
const paging = ref(null);

// 模拟的完整技师数据（实际项目中通过接口获取）
const allTechniciansData = [
  {
    id: 1,
    name: "兰菊清",
    rating: 4.8,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    availableTime: "12:00",
    distance: "0.31km",
    services: ["冰箱维修", "彩电维修"],
    type: "家电维修",
    gender: "male",
    serviceScope: ["on_site"],
    availableToday: true,
    availableImmediate: true,
  },
  {
    id: 2,
    name: "吴明山",
    rating: 4.7,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    availableTime: "12:00",
    distance: "1.01km",
    services: ["冰箱维修", "彩电维修", "搬家服务"],
    type: "综合服务",
    gender: "male",
    serviceScope: ["on_site", "remote_help"],
    availableToday: true,
    availableImmediate: false,
  },
  {
    id: 3,
    name: "李旺旺",
    rating: 4.8,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    availableTime: "12:00",
    distance: "1.15km",
    services: ["冰箱维修", "彩电维修", "水电修装"],
    type: "水电安装",
    gender: "female",
    serviceScope: ["on_site"],
    availableToday: false,
    availableImmediate: false,
  },
  {
    id: 4,
    name: "陈晓源",
    rating: 5.0,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    availableTime: "12:00",
    distance: "2.71km",
    services: ["冰箱维修", "彩电维修"],
    type: "家电维修",
    gender: "male",
    serviceScope: ["on_site"],
    availableToday: true,
    availableImmediate: true,
  },
  {
    id: 5,
    name: "杨清远",
    rating: 4.6,
    avatar: "/static/default_avator.png",
    serviceCount: 20,
    availableTime: "12:00",
    distance: "3.08km",
    services: ["冰箱维修", "彩电维修"],
    type: "家电维修",
    gender: "male",
    serviceScope: ["remote_help"],
    availableToday: false,
    availableImmediate: false,
  },
  {
    id: 6,
    name: "张三",
    rating: 4.5,
    avatar: "/static/default_avator.png",
    serviceCount: 15,
    availableTime: "13:00",
    distance: "0.5km",
    services: ["空调维修", "洗衣机维修"],
    type: "家电维修",
    gender: "male",
    serviceScope: ["on_site"],
    availableToday: true,
    availableImmediate: true,
  },
  {
    id: 7,
    name: "李四",
    rating: 4.9,
    avatar: "/static/default_avator.png",
    serviceCount: 25,
    availableTime: "11:00",
    distance: "1.2km",
    services: ["管道疏通", "灯具安装"],
    type: "管道疏通",
    gender: "female",
    serviceScope: ["on_site", "to_store"],
    availableToday: true,
    availableImmediate: false,
  },
  {
    id: 8,
    name: "王五",
    rating: 4.3,
    avatar: "/static/default_avator.png",
    serviceCount: 18,
    availableTime: "14:00",
    distance: "2.0km",
    services: ["热水器维修", "电路检修"],
    type: "水电安装",
    gender: "male",
    serviceScope: ["on_site"],
    availableToday: true,
    availableImmediate: true,
  },
  {
    id: 9,
    name: "赵六",
    rating: 4.7,
    avatar: "/static/default_avator.png",
    serviceCount: 22,
    availableTime: "10:30",
    distance: "0.8km",
    services: ["电视安装", "音响调试"],
    type: "家电安装",
    gender: "male",
    serviceScope: ["remote_help"],
    availableToday: true,
    availableImmediate: false,
  },
  {
    id: 10,
    name: "孙七",
    rating: 4.0,
    avatar: "/static/default_avator.png",
    serviceCount: 10,
    availableTime: "15:00",
    distance: "3.5km",
    services: ["电脑维修", "网络布线"],
    type: "数码维修",
    gender: "female",
    serviceScope: ["to_store"],
    availableToday: false,
    availableImmediate: false,
  },
  ...Array.from({ length: 50 }, (_, i) => {
    const types = [
      "家电维修",
      "水电安装",
      "管道疏通",
      "数码维修",
      "综合服务",
      "搬家服务",
    ];
    const scopes = ["on_site", "remote_help", "to_store"];
    const genders = ["male", "female"];
    return {
      id: i + 11,
      name: `模拟技师${i + 11}`,
      rating: (Math.random() * 0.5 + 4.0).toFixed(1),
      avatar: "/static/default_avator.png",
      serviceCount: Math.floor(Math.random() * 50) + 10,
      availableTime: `${Math.floor(Math.random() * 12) + 9}:00`,
      distance: `${(Math.random() * 5 + 0.1).toFixed(2)}km`,
      services: ["冰箱维修", "彩电维修", "空调维修", "水电修装"]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1),
      type: types[Math.floor(Math.random() * types.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      serviceScope: scopes
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1),
      availableToday: Math.random() > 0.5,
      availableImmediate: Math.random() > 0.7,
    };
  }),
];

// 监听器
watch(searchKeyword, () => {
  if (paging.value) {
    paging.value.reload();
  }
});

// z-paging 监听虚拟列表数组改变并赋值给 virtualTechnicians 进行重新渲染
const virtualListChange = (vList) => {
  virtualTechnicians.value = vList;
};

// z-paging 的数据请求方法
const queryList = async (pageNo, pageSize) => {
  // 模拟网络请求延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  let result = [...allTechniciansData];

  // 搜索过滤
  if (searchKeyword.value) {
    result = result.filter(
      (tech) =>
        tech.name.includes(searchKeyword.value) ||
        tech.services.some((service) => service.includes(searchKeyword.value)),
    );
  }

  // **师傅类型筛选**
  if (selectedTechnicianType.value) {
    result = result.filter(
      (tech) => tech.type === selectedTechnicianType.value,
    );
  }

  // **新增：更多筛选条件的应用**
  const filters = moreFilterConditions.value;

  // 服务范围筛选 (多选)
  if (filters.serviceScope.length > 0) {
    result = result.filter((tech) =>
      filters.serviceScope.every(
        (scope) => tech.serviceScope && tech.serviceScope.includes(scope),
      ),
    );
  }

  // 可预约时间筛选 (单选)
  if (filters.availability === "immediate") {
    result = result.filter((tech) => tech.availableImmediate);
  } else if (filters.availability === "today") {
    result = result.filter((tech) => tech.availableToday);
  }
  // You would add more specific logic for 'tomorrow' or 'weekend' if you have date data

  // 技师性别筛选 (单选)
  if (filters.gender) {
    result = result.filter((tech) => tech.gender === filters.gender);
  }

  // 排序 (只处理距离和评分的排序)
  if (activeFilter.value === "distance") {
    result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } else if (activeFilter.value === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }
  // 注意：当 activeFilter.value 是 'type' 时，这里不会进行额外的排序，
  // 而是仅根据 selectedTechnicianType.value 进行筛选。

  // 模拟分页逻辑
  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;
  const currentPageData = result.slice(start, end);

  // 将请求的结果数组传递给z-paging
  if (paging.value) {
    paging.value.complete(currentPageData);
  }
};

// 其他方法
const selectLocation = () => {
  console.log("选择位置");
  // 显示位置选择器
};

const navigateToSearch = () => {
  console.log("导航到搜索页");
  // 假设 search-section 内部会处理导航
};

// 设置距离和评分的排序筛选
const setSortFilter = (filter) => {
  activeFilter.value = filter;
  // 关闭师傅类型弹窗，以防万一
  showTypeFilterPopup.value = false;
  if (paging.value) {
    paging.value.reload();
  }
};

// 显示师傅类型筛选弹窗
const showTechnicianTypeFilter = () => {
  activeFilter.value = "type"; // 高亮“师傅类型”tab
  showTypeFilterPopup.value = true;
};

// 处理师傅类型弹窗关闭时的逻辑
const handleTypePopupClose = () => {
  // If activeFilter is 'type' when popup closes, keep it highlighted.
  // Otherwise, if user clicks outside after selecting, it remains.
  // No explicit action needed here unless you want to reset activeFilter.
};

// 选择师傅类型并触发数据加载
const selectTechnicianType = (type) => {
  selectedTechnicianType.value = type;
  showTypeFilterPopup.value = false; // 关闭弹窗
  if (paging.value) {
    paging.value.reload(); // 触发列表重新加载
  }
};

// 显示更多筛选弹窗 (原先的“筛选”按钮)
const showMoreFilterPopup = () => {
  // 当点击“筛选”时，取消高亮“距离”、“评分”、“师傅类型”
  activeFilter.value = "";
  showMoreFilter.value = true;
};

// Toggle for Service Scope (multi-select)
const toggleServiceScope = (value) => {
  const index = moreFilterConditions.value.serviceScope.indexOf(value);
  if (index > -1) {
    moreFilterConditions.value.serviceScope.splice(index, 1); // Remove if already selected
  } else {
    moreFilterConditions.value.serviceScope.push(value); // Add if not selected
  }
};

// 更多筛选弹窗的重置
const resetMoreFilters = () => {
  moreFilterConditions.value = {
    // Reset all more filters
    serviceScope: [],
    availability: "",
    gender: "",
  };
  showMoreFilter.value = false;
  // 重置后可能需要恢复默认排序，例如：
  activeFilter.value = "distance";
  selectedTechnicianType.value = ""; // 清空师傅类型筛选
  if (paging.value) {
    paging.value.reload();
  }
};

// 更多筛选弹窗的应用
const applyMoreFilters = () => {
  showMoreFilter.value = false;
  // This will trigger queryList with the updated moreFilterConditions.value
  if (paging.value) {
    paging.value.reload();
  }
};

const makeAppointment = (technician) => {
  console.log("预约技师:", technician.name);
  uni.navigateTo({
    url: `/pages/appointment/appointment?technicianId=${technician.id}`,
  });
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
  padding: 24rpx 32rpx;
  background: #fff;

  .location-selector {
    display: flex;
    align-items: center;

    .iconfont {
      color: $color-success;
      font-size: 40rpx;
    }

    .location-text {
      font-size: 32rpx;
      color: #333;
      margin: 0 8rpx;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 32rpx;
  }
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;

  .filter-tab {
    margin-right: 64rpx;
    padding-bottom: 16rpx;
    position: relative;
    display: flex;
    // 使图标和文字对齐
    align-items: center;
    gap: 8rpx;
    // 文字和图标的间距

    &.active {
      .tab-text {
        color: #000;
        font-weight: 500;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4rpx;
        background: #52c41a;
      }
    }

    .tab-text {
      font-size: 32rpx;
      color: #333;
    }
  }

  .filter-more {
    margin-left: auto;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 24rpx;
    padding: 6rpx 16rpx;
    align-self: flex-start;

    .filter-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

/* 技师列表 */
.z-paging-technician-list {
  flex: 1;
  // padding: 0 16px;
  box-sizing: border-box;
}

.technician-item {
  margin-bottom: 20rpx;

  .technician-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;

    .technician-info {
      display: flex;
      gap: 24rpx;

      .technician-avatar {
        flex-shrink: 0;
        width: 150rpx;
        height: 150rpx;
        border-radius: 50%;
      }

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
            font-size: 32rpx;
          }

          .technician-rating {
            color: #ff8c00;
            font-size: 28rpx;
          }
        }

        .technician-stats {
          margin-bottom: 16rpx;

          .stats-text {
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
          flex-wrap: wrap;
          gap: 12rpx;

          .service-tag {
            margin-bottom: 8rpx;
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
          font-size: 24rpx;
        }

        .appointment-btn {
          border-radius: 40rpx;
          padding: 0 32rpx;
        }
      }
    }
  }
}

/* 师傅类型筛选弹窗内容 */
.type-filter-popup-content {
  background: #fff;
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom) + 100rpx);
  max-height: 80vh;
  // 限制高度，防止过长
  overflow-y: auto;
  // 允许滚动

  .type-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 40rpx;
    font-size: 32rpx;
    color: #333;
    border-bottom: 2rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      color: #52c41a;
      font-weight: 500;
    }
  }
}

/* 更多筛选弹窗 */
.filter-popup {
  background: #fff;
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom) + 100rpx);
  max-height: 80vh;
  overflow-y: auto;

  .filter-content {
    .filter-title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 40rpx;
      text-align: center;
    }

    .filter-section {
      margin-bottom: 40rpx;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #f0f0f0;

      &:last-of-type {
        border-bottom: none;
      }

      .section-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 30rpx;
        display: block;
      }

      .tag-group {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .filter-tag-item {
          padding: 16rpx 30rpx;
          border-radius: 40rpx;
          font-size: 28rpx;
        }
      }
    }

    .popup-actions {
      display: flex;
      justify-content: space-between;
      gap: 32rpx;
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      padding-top: 30rpx;
      z-index: 10;

      .action-btn {
        flex: 1;
        height: 88rpx;
      }

      .confirm-btn {
        background-color: #52c41a;
        color: #fff;
      }
    }
  }
}
</style>
