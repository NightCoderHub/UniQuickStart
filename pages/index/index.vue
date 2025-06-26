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
    <view class="search-section">
      <wd-search
        v-model="searchValue"
        placeholder-left
        :placeholder-style="{ color: '#3D3D3D' }"
        placeholder="输入服务内容"
        hide-cancel
        disabled
      >
      </wd-search>
      <view class="search-suffix">
        <text class="iconfont icon-saoyisao qr-icon" @click="scanQR"></text>
        <image class="ai-tag" src="/static/ai.png"></image>
      </view>
    </view>
    <view class="main-content">
      <wd-tabs v-model="activeTab">
        <block v-for="(item, index) in tabsList" :key="index">
          <wd-tab :title="`${item.title}`" :name="item.name">
            <horizontal-tab-scroll
              :tabs="currentCategorySubcategories"
              :default-index="currentTabIndex"
              @tab-change="onTabChange"
            >
            </horizontal-tab-scroll>
          </wd-tab>
        </block>
      </wd-tabs>
      <view style="padding: 0 24rpx">
        <view class="main-banner">
          <view class="banner-content">
            <view class="banner-text">
              <text class="banner-title">一键订水</text>
              <text class="banner-subtitle">净水速达</text>
            </view>
            <text class="banner-service">附近服务</text>
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
          }))
        : [];
    },
  },
  watch: {
    activeTab() {
      // 当 activeTab 变化时，重置 currentTabIndex 为 0，并更新 selectedTab
      this.currentTabIndex = 0;
      if (this.currentCategorySubcategories.length > 0) {
        this.selectedTab = {
          id: this.currentCategorySubcategories[0].id,
          text: this.currentCategorySubcategories[0].text,
        };
      } else {
        this.selectedTab = {
          id: "",
          text: "",
        };
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
      this.selectedTab = {
        id: this.currentCategorySubcategories[0].id,
        text: this.currentCategorySubcategories[0].text,
      };
    }
  },
  methods: {
    /**
     * 监听子组件派发的 tab-change 事件
     * @param {object} eventData - 子组件传递过来的数据
     */
    onTabChange(eventData) {
      console.log("父组件接收到事件:", eventData);
      // 更新父组件的状态
      this.currentTabIndex = eventData.index;
      this.selectedTab = {
        id: eventData.item.id,
        text: eventData.item.text,
      };
    },
    selectLocation() {
      console.log("选择位置");
    },
    scanQR() {
      console.log("扫描二维码");
    },
    requestService() {
      console.log("我需要服务");
    },
    handleServiceClick(service) {
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
      color: $color-primary;
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

// 搜索栏样式
.search-section {
  position: relative;

  .search-suffix {
    position: absolute;
    top: 50%;
    right: 48rpx;
    transform: translateY(-50%);
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20rpx;

    .qr-icon {
      font-size: 40rpx;
      color: #000;
    }

    .ai-tag {
      width: 40rpx;
      height: 40rpx;
    }
  }
}

// 主要内容样式
.main-content {
  // padding: 0 24rpx;
  // padding: 0 20px 100px 20px;
}

// 高亮边框
.wd-tabs__line {
  bottom: 0px !important;
}

// 主要横幅样式
.main-banner {
  background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%);
  border-radius: 15px;
  padding: 30px 20px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .banner-content {
    flex: 1;

    .banner-text {
      margin-bottom: 40px;

      .banner-title {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #2e7d32;
        margin-bottom: 5px;
      }

      .banner-subtitle {
        display: block;
        font-size: 18px;
        color: #2e7d32;
      }
    }

    .banner-service {
      font-size: 20px;
      font-weight: bold;
      color: #2e7d32;
    }
  }
}

// 服务按钮样式
.service-button {
  font-size: 48rpx !important;
  font-weight: 600 !important;
  height: 120rpx !important;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
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
      width: 50px;
      height: 50px;
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
