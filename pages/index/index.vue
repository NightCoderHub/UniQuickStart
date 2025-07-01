<template>
  <view class="page">
    <wd-navbar :bordered="false" placeholder safe-area-inset-top>
      <template #left>
        <view class="nav-left">
          <view class="location-wrapper" @click="selectLocation">
            <text class="iconfont icon-dingwei location-icon"></text>
            <text class="location-text">铜仁</text>
            <wd-icon name="arrow-down" size="32rpx"></wd-icon>
          </view>
        </view>
      </template>
    </wd-navbar>
    <view class="placeholder-bar"> </view>
    <search-section
      :is-enabled="false"
      @click="navigateToSearch"
    ></search-section>
    <view class="main-content">
      <view class="tabs-container">
        <wd-tabs v-model="activeTab">
          <block v-for="(item, index) in tabsList" :key="index">
            <wd-tab :title="`${item.title}`" :name="item.name"> </wd-tab>
          </block>
        </wd-tabs>
      </view>

      <horizontal-tab-scroll
        :tabs="currentCategorySubcategories"
        :default-index="currentTabIndex"
        @tab-change="onTabChange"
      >
      </horizontal-tab-scroll>
      <view style="padding: 0 24rpx">
        <view class="main-banner">
          <view class="banner-content">
            <view class="banner-text">
              <text
                v-for="(tag, index) in selectedTab.tags"
                :key="index"
                class="banner-title"
              >
                {{ tag }}
              </text>
            </view>
            <text class="banner-divide"> </text>
            <text class="banner-service">{{ selectedTab.text }} </text>
            <image
              class="banner-image level-1"
              src="/static/微信图片_20250626192715.png"
              mode="widthFix"
            ></image>
            <image
              v-show="activeTab === 'home_care'"
              class="banner-image level-2"
              src="/static/home_care.png"
              mode="widthFix"
            ></image>
            <image
              v-show="activeTab === 'housekeeping'"
              class="banner-image level-3"
              src="/static/housekeeping.png"
              mode="widthFix"
            ></image>
            <image
              v-show="activeTab === 'nearby_services'"
              class="banner-image level-4"
              src="/static/nearby_services-1.png"
              mode="widthFix"
            ></image>
            <image
              v-show="activeTab === 'nearby_services'"
              class="banner-image level-5"
              src="/static/nearby_services-2.png"
              mode="widthFix"
            ></image>
          </view>
        </view>
        <wd-button
          type="primary"
          size="large"
          :round="false"
          block
          custom-class="service-button"
          @click="requestService"
        >
          我需要服务
        </wd-button>
        <view class="bottom-services">
          <block v-for="(service, index) in bottomServices" :key="index">
            <view class="service-item" @click="handleServiceClick(service)">
              <view class="service-icon" :class="service.iconClass">
                <text class="iconfont" :class="service.icon"></text>
              </view>
              <text class="service-label">{{ service.name }}</text>
            </view>
          </block>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import servicesData from "@/mock/services.json";

export default {
  data() {
    return {
      searchValue: "",
      tabsList: [
        {
          name: "elderly",
          title: "居家养老",
        },
        {
          name: "nearby",
          title: "附近服务",
        },
        {
          name: "housekeeping",
          title: "家政和维修",
        },
      ],
      activeTab: "home_care",
      bottomServices: [
        {
          name: "团队加入",
          icon: "icon-tuanduijiaru",
          iconClass: "green-bg",
        },
        {
          name: "加入就业",
          icon: "icon-jiarujiuye",
          iconClass: "blue-bg",
        },
        {
          name: "区域合作",
          icon: "icon-quyuhezuo2",
          iconClass: "cyan-bg",
        },
        {
          name: "企业用人",
          icon: "icon-qiyeyongren1",
          iconClass: "orange-bg",
        },
      ],
      // 父组件中维护的选中索引
      currentTabIndex: 0,
      // 父组件中维护的选中 Tab 对象
      selectedTab: {
        id: "",
        text: "",
      },
      allServices: servicesData.data, // 存储 services.json 中的所有数据
    };
  },
  computed: {
    // 根据 activeTab 动态计算当前分类的二级分类
    currentCategorySubcategories() {
      const category = this.allServices.find(
        (item) => item.category_id === this.activeTab,
      );
      // 将 subcategories 转换为 horizontal-tab-scroll 组件所需的格式
      return category
        ? category.subcategories.map((sub) => ({
            id: sub.subcategory_id,
            text: sub.subcategory_name,
            tags: sub.tags,
          }))
        : [];
    },
  },
  watch: {
    activeTab() {
      // 当 activeTab 变化时，重置 currentTabIndex 为 0，并更新 selectedTab
      this.currentTabIndex = 0;
      if (this.currentCategorySubcategories.length > 0) {
        this.selectedTab = this.currentCategorySubcategories[0];
      } else {
        this.selectedTab = {};
      }
    },
  },
  onLoad() {
    // 初始化 tabsList
    this.tabsList = this.allServices.map((category) => ({
      name: category.category_id,
      title: category.category_name,
    }));

    // 设置初始的 activeTab 为第一个分类的 category_id
    if (this.tabsList.length > 0) {
      this.activeTab = this.tabsList[0].name;
    }

    // 初始化 currentTabIndex 和 selectedTab
    if (this.currentCategorySubcategories.length > 0) {
      this.selectedTab = this.currentCategorySubcategories[0];
    }
  },
  methods: {
    devToast() {
      console.log(11);
      this.$devToast();
    },
    /**
     * 监听子组件派发的 tab-change 事件
     * @param {object} eventData - 子组件传递过来的数据
     */
    onTabChange(eventData) {
      console.log("父组件接收到事件:", eventData);
      // 更新父组件的状态
      this.currentTabIndex = eventData.index;
      this.selectedTab = eventData.item;
    },
    selectLocation() {
      console.log("选择位置");
      this.$devToast();
    },
    navigateToSearch() {
      this.$devToast();
    },
    scanQR() {
      console.log("扫描二维码");
      this.$devToast();
    },
    requestService() {
      console.log("我需要服务");
      uni.navigateTo({
        url: "/pages/service-detail/service-detail",
      });
    },
    handleServiceClick(service) {
      this.$devToast();
      console.log("点击服务:", service.name);
    },
  },
};
</script>

<style lang="scss">
.page {
  // min-height: 100vh;
}

// 导航栏样式
.nav-left {
  .location-wrapper {
    display: flex;
    align-items: center;

    .location-icon {
      color: $color-success;
      font-size: 32rpx;
      margin-right: 8rpx;
    }

    .location-text {
      font-size: 28rpx;
      font-weight: normal;
      margin-right: 8rpx;
      line-height: 44rpx;
      color: $color-text-base;
    }
  }
}

.placeholder-bar {
  height: 16rpx;
  background-color: #fff;
}

// 主要内容样式
.main-content {
  // padding: 0 24rpx;
  // padding: 0 20px 100px 20px;
  .tabs-container {
    padding: 0 60rpx;
    width: 100%;
    box-sizing: border-box;
    background-color: #fff;
  }
}

// 高亮边框
.wd-tabs__line {
  bottom: 0px !important;
}

// 主要横幅样式
.main-banner {
  background: #cdf1e1;
  border-radius: 16rpx;
  // padding: 30px 20px;
  position: relative;
  overflow: hidden;
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  height: 620rpx;
  .banner-content {
    // flex: 1;

    .banner-text {
      position: absolute;
      top: 40rpx;
      left: 44rpx;
      width: 80%;

      .banner-title {
        display: inline-block;
        font-size: 40rpx;
        font-weight: bold;
        color: $color-success;
        margin-right: 24rpx;
        margin-bottom: 12rpx;
      }
    }

    .banner-divide {
      position: absolute;
      bottom: 40%;
      left: 44rpx;
      display: inline-block;
      width: 192rpx;
      height: 2rpx;
      background-color: $color-success;
    }

    .banner-service {
      position: absolute;
      bottom: 120rpx;
      left: 44rpx;
      font-size: 48rpx;
      font-weight: 600;
      color: $color-success;
    }

    .banner-image {
      position: absolute !important;
      will-change: transform;
      &.level-1 {
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
      }
      &.level-2 {
        right: 0;
        bottom: 0;
        width: 440rpx;
      }
      &.level-3 {
        right: -30rpx;
        bottom: 0;
        width: 440rpx;
      }
      &.level-4 {
        right: 210rpx;
        bottom: 84rpx;
        width: 314rpx;
      }
      &.level-5 {
        right: -70rpx;
        bottom: -20rpx;
        width: 440rpx;
      }
    }
  }
}

// 服务按钮样式
.service-button {
  font-size: 48rpx !important;
  font-weight: 600 !important;
  height: 120rpx !important;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

// 底部服务样式
.bottom-services {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-evenly;
  .service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    &:active {
      background-color: #f1f1f1;
    }
    .service-icon {
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        font-size: 80rpx;
      }

      &.green-bg {
        .iconfont {
          color: #0ad097;
        }
      }

      &.blue-bg {
        .iconfont {
          color: #0ab7ee;
        }
      }

      &.cyan-bg {
        .iconfont {
          color: #04cdda;
        }
      }

      &.orange-bg {
        .iconfont {
          color: #f5c763;
        }
      }
    }

    .service-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  }
}
</style>
