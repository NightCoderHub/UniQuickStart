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
    <!-- 搜索栏 -->
    <view class="search-section">
      <wd-search
        v-model="searchValue"
        placeholder-left
        placeholder="输入服务内容"
        hide-cancel
        placeholder-class="search-placeholder"
      >
      </wd-search>
      <view class="search-suffix">
        <text class="iconfont icon-saoyisao qr-icon" @click="scanQR"></text>
        <image class="ai-tag" src="/static/ai.png"></image>
      </view>
    </view>
    <!-- 主要内容 -->
    <view class="main-content">
      <!-- 标签页 -->
      <wd-tabs v-model="activeTab">
        <block v-for="(item, index) in tabsList" :key="index">
          <wd-tab :title="`${item.title}`" :name="item.name">
            <view class="content">内容{{ item.title }}</view>
          </wd-tab>
        </block>
      </wd-tabs>
      <view style="padding: 0 24rpx">
        <!-- 服务分类标签 -->
        <!-- <view class="service-tags">
        <wd-tag 
          v-for="(tag, index) in serviceTags" 
          :key="index"
          :type="tag.active ? 'success' : 'info'"
          :plain="!tag.active"
          round
          size="large"
          @click="selectTag(index)"
          custom-class="service-tag"
        >
          {{ tag.name }}
        </wd-tag>
      </view> -->

        <swipe-tabs :tab-list="myTabs" :initial-active-id="initialId">
          <template #content>
            <view style="padding: 20px; text-align: center">
              <text>当前选中 Tab 的 ID: {{ currentTab.id }}</text>
              <text>\n当前选中 Tab 的名称: {{ currentTab.name }}</text>
            </view>
          </template>
        </swipe-tabs>

        <!-- 		<view v-for="i in 50" :key="i" style="height: 50px; background-color: #f0f0f0; margin-top: 10px; display: flex; align-items: center; justify-content: center;">
						<text>占位内容 {{ i }}</text>
					</view> -->

        <!-- 主要横幅 -->
        <view class="main-banner">
          <view class="banner-content">
            <view class="banner-text">
              <text class="banner-title">一键订水</text>
              <text class="banner-subtitle">净水速达</text>
            </view>
            <text class="banner-service">附近服务</text>
          </view>
          <view class="banner-image">
            <image
              class="water-bottles"
              src="/static/water-bottles.png"
              mode="aspectFit"
            />
          </view>
        </view>

        <!-- 服务按钮 -->
        <wd-button
          type="primary"
          size="large"
          round
          block
          custom-class="service-button"
          @click="requestService"
        >
          我需要服务
        </wd-button>

        <!-- 底部服务选项 -->
        <view class="bottom-services">
          <wd-grid :column="4" :border="false">
            <wd-grid-item
              v-for="(service, index) in bottomServices"
              :key="index"
              @click="handleServiceClick(service)"
            >
              <view class="service-item">
                <view class="service-icon" :class="service.iconClass">
                  <text class="iconfont" :class="service.icon"></text>
                </view>
                <text class="service-label">{{ service.name }}</text>
              </view>
            </wd-grid-item>
          </wd-grid>
        </view>
      </view>
    </view>
    <scroll-view
      class="horizontal-scroll"
      scroll-x="true"
      :scroll-with-animation="true"
      :scroll-into-view="toView"
    >
      <view class="item-container">
        <view
          v-for="(item, index) in items"
          :id="'item-' + index"
          :key="index"
          class="scroll-item"
          :class="{ active: activeIndex === index }"
          @click="scrollToItem(index)"
        >
          {{ item.text }}
        </view>
      </view>
    </scroll-view>
    <horizontal-tab-scroll
      :tabs="tabList"
      :default-index="currentTabIndex"
      @tab-change="onTabChange"
    >
    </horizontal-tab-scroll>

    <view class="content-display">
      <text>当前选中的是：{{ selectedTab.text }}</text>
      <view class="main-content">
        <view v-for="n in 10" :key="n" class="content-block">
          <text>这是 {{ selectedTab.text }} 的第 {{ n }} 段内容</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
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
      activeTab: "elderly",
      serviceTags: [
        {
          name: "送桶装水",
          active: true,
        },
        {
          name: "临时工",
          active: false,
        },
        {
          name: "上门开锁",
          active: false,
        },
        {
          name: "管道疏通",
          active: false,
        },
        {
          name: "流动补胎",
          active: false,
        },
      ],
      bottomServices: [
        {
          name: "团队加入",
          icon: "icon-team",
          iconClass: "green-bg",
        },
        {
          name: "加入就业",
          icon: "icon-work",
          iconClass: "blue-bg",
        },
        {
          name: "区域合作",
          icon: "icon-cooperation",
          iconClass: "cyan-bg",
        },
        {
          name: "企业用人",
          icon: "icon-enterprise",
          iconClass: "orange-bg",
        },
      ],
      myTabs: [
        {
          id: "all",
          name: "全部",
        },
        {
          id: "hot",
          name: "热门推荐",
        },
        {
          id: "new",
          name: "最新发布",
        },
        {
          id: "tech",
          name: "技术分享",
        },
        {
          id: "life",
          name: "生活随笔",
        },
        {
          id: "travel",
          name: "旅行游记",
        },
        {
          id: "food",
          name: "美食探店",
        },
        {
          id: "qa",
          name: "问答区",
        },
        {
          id: "other",
          name: "其他分类",
        },
      ],
      initialId: "hot", // 初始选中 '热门推荐'
      currentTab: {}, // 存储当前选中的 Tab 对象

      // 模拟数据
      items: [
        {
          text: "Item 1",
        },
        {
          text: "Item 2",
        },
        {
          text: "Item 3",
        },
        {
          text: "Item 4",
        },
        {
          text: "Item 5",
        },
        {
          text: "Item 6",
        },
        {
          text: "Item 7",
        },
        {
          text: "Item 8",
        },
      ],
      // 滚动目标元素的 ID
      toView: "",
      // 当前激活项的索引
      activeIndex: 0,
      // 传递给子组件的 Tab 数据
      tabList: [
        {
          text: "热门",
        },
        {
          text: "最新",
        },
        {
          text: "推荐",
        },
        {
          text: "直播",
        },
        {
          text: "科技",
        },
        {
          text: "体育",
        },
        {
          text: "娱乐",
        },
        {
          text: "财经",
        },
        {
          text: "军事",
        },
        {
          text: "教育",
        },
        {
          text: "美食",
        },
        {
          text: "旅游",
        },
        {
          text: "汽车",
        },
        {
          text: "房产",
        },
        {
          text: "游戏",
        },
        {
          text: "时尚",
        },
      ],
      // 父组件中维护的选中索引
      currentTabIndex: 0,
      // 父组件中维护的选中 Tab 对象
      selectedTab: {
        text: "热门",
      },
    };
  },
  mounted() {
    // 初始化 currentTab
    this.currentTab =
      this.myTabs.find((tab) => tab.id === this.initialId) || {};
  },
  onLoad() {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 20;
  },
  methods: {
    /**
     * 点击某一项时，滚动到该项
     * @param {number} index - 被点击项的索引
     */
    scrollToItem(index) {
      // 更新激活项的索引，用于高亮显示
      this.activeIndex = index;

      // 设置 scroll-into-view 的值，触发滚动
      // uni-app 的 scroll-into-view 属性需要绑定到 data 里的变量
      this.toView = "item-" + index;

      console.log("Scrolling to:", this.toView);
    },
    // onTabChange(tab) {
    // 	console.log("当前选中的 Tab:", tab);
    // 	this.currentTab = tab;
    // 	// 在这里你可以根据选中的 Tab 加载相应的内容
    // 	uni.showToast({
    // 		title: `选中: ${tab.name}`,
    // 		icon: "none",
    // 	});
    // },
    /**
     * 监听子组件派发的 tab-change 事件
     * @param {object} eventData - 子组件传递过来的数据
     */
    onTabChange(eventData) {
      console.log("父组件接收到事件:", eventData);
      // 更新父组件的状态
      this.currentTabIndex = eventData.index;
      this.selectedTab = eventData.item;
      // 在这里可以发起网络请求，根据选中的 Tab 切换内容
      // this.fetchContent(eventData.item.text);
    },
    selectLocation() {
      console.log("选择位置");
    },
    scanQR() {
      console.log("扫描二维码");
    },
    selectTag(index) {
      this.serviceTags.forEach((tag, i) => {
        tag.active = i === index;
      });
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

  .wd-search__search-left-icon {
    left: 24rpx !important;
  }

  .search-placeholder {
    background-color: #f4f4f4;
    color: $color-gray-800;
    font-size: 24rpx;
    line-height: 40rpx;
  }

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

// 服务标签样式
.service-tags {
  display: flex;
  gap: 10px;
  padding: 15px 0;
  overflow-x: auto;

  .service-tag {
    white-space: nowrap;
    flex-shrink: 0;
  }
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

  .banner-image {
    flex-shrink: 0;

    .water-bottles {
      width: 160px;
      height: 120px;
    }
  }
}

// 服务按钮样式
.service-button {
  margin: 20px 0 30px 0;
  font-size: 18px !important;
  font-weight: 500 !important;
}

// 底部服务样式
.bottom-services {
  margin-bottom: 20px;

  .service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;

    .service-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      .iconfont {
        font-size: 24px;
        color: white;
      }

      &.green-bg {
        background-color: #4caf50;
      }

      &.blue-bg {
        background-color: #2196f3;
      }

      &.cyan-bg {
        background-color: #00bcd4;
      }

      &.orange-bg {
        background-color: #ff9800;
      }
    }

    .service-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  }
}

// 底部导航样式
.nav-icon {
  font-size: 20px;
}

/* index.wxss */
.horizontal-scroll {
  width: 100%;
  /* 必须设置宽度，否则无法滚动 */
  height: 200rpx;
  /* 必须设置高度，否则无法显示 */
  white-space: nowrap;
  /* 阻止子元素换行 */
}

.item-container {
  display: flex;
  /* 使用 flex 布局 */
  flex-direction: row;
  /* 子元素横向排列 */
  padding-bottom: 20rpx;
  /* 留出底部滚动条空间 */
}

.scroll-item {
  width: 150rpx;
  /* 宽度 */
  height: 100rpx;
  /* 高度 */
  flex-shrink: 0;
  /* 防止项目被压缩 */
  margin-right: 20rpx;
  background-color: #f0f0f0;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: #333;
  transition: all 0.3s ease;
  /* 添加过渡效果 */
  box-sizing: border-box;
  /* 边框和内边距不影响宽度 */
  border: 4rpx solid transparent;
  /* 默认透明边框 */
}

/* 点击后激活的样式 */
.scroll-item.active {
  background-color: #007aff;
  color: #fff;
  font-weight: bold;
  transform: scale(1.05);
  /* 稍微放大 */
  border-color: #007aff;
}

/* 最后一个元素可以移除右边距，使其与容器对齐 */
.scroll-item:last-child {
  margin-right: 0;
}
</style>
