<template>
  <view class="swipe-tabs-container">
    <view class="tabs-wrapper" :class="{ expanded: isExpanded }">
      <scroll-view
        class="tabs-scroll-view"
        :scroll-x="true"
        scroll-with-animation
        :scroll-left="scrollLeft"
      >
        <view class="tabs-list">
          <view
            v-for="(item, index) in tabList"
            :id="`tab-item-${item.id}`"
            :key="index"
            class="tab-item"
            :class="{ active: item.id === activeTabId }"
            @tap="selectTab(item)"
          >
            <text>{{ item.name }}</text>
          </view>
          <view class="tab-line" :style="lineStyle"></view>
        </view>
      </scroll-view>
      <view v-if="tabList.length > 4" class="expand-btn" @tap="toggleExpand">
        <text class="arrow" :class="{ 'arrow-up': isExpanded }"></text>
      </view>
    </view>

    <view v-show="isExpanded" class="tabs-expanded-panel">
      <view class="tabs-expanded-grid">
        <view
          v-for="(item, index) in tabList"
          :key="index"
          class="tab-item-expanded"
          :class="{ active: item.id === activeTabId }"
          @tap="selectTab(item, true)"
        >
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <view class="content-placeholder">
      <slot name="content"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "SwipeTabs",
  props: {
    // Tab 数据列表，每个项需要有 id 和 name
    tabList: {
      type: Array,
      default: () => [],
    },
    // 初始选中的 Tab id
    initialActiveId: {
      type: [String, Number],
      default: "",
    },
  },
  data() {
    return {
      activeTabId: this.initialActiveId, // 当前选中 Tab 的 ID
      lineStyle: {
        // 下划线样式
        width: "0px",
        transform: "translateX(0px)",
      },
      tabItemRects: [], // 存储每个 Tab 项的尺寸和位置信息
      isExpanded: false, // 是否展开所有 Tab
      scrollLeft: 0, // 控制 scroll-view 的横向滚动位置
      scrollViewWidth: 0, // 存储 scroll-view 的宽度
      tabsListOffsetLeft: 0, // tabs-list 容器的左偏移量，用于计算 Tab 项的相对位置
    };
  },
  watch: {
    tabList: {
      handler() {
        this.$nextTick(() => {
          this.getLayoutInfo(); // 统一获取布局信息
        });
      },
      immediate: true, // 立即执行一次
    },
    activeTabId() {
      this.$nextTick(() => {
        this.updateLineStyle();
        this.scrollToCenter(); // 选中时滚动到中心
      });
    },
  },
  mounted() {
    this.getLayoutInfo();
  },
  methods: {
    // 统一获取布局信息：Tab 项尺寸、scroll-view 宽度和 tabs-list 偏移
    getLayoutInfo() {
      const query = uni.createSelectorQuery().in(this);

      // 获取所有 Tab 项的尺寸信息
      query
        .selectAll(".tab-item")
        .boundingClientRect((data) => {
          if (data && data.length) {
            this.tabItemRects = data;
            this.updateLineStyle();
            // 如果是初始加载或 tabList 变化，自动滚动到初始选中项
            if (this.initialActiveId && !this.activeTabId) {
              this.activeTabId = this.initialActiveId;
            }
            this.scrollToCenter();
          }
        })
        .exec();

      // 获取 scroll-view 的宽度
      query
        .select(".tabs-scroll-view")
        .boundingClientRect((data) => {
          if (data) {
            this.scrollViewWidth = data.width;
          }
        })
        .exec();

      // 获取 tabs-list 的左侧偏移，用于计算 Tab 项在滚动区域内的真实位置
      query
        .select(".tabs-list")
        .boundingClientRect((data) => {
          if (data) {
            this.tabsListOffsetLeft = data.left;
          }
        })
        .exec();
    },
    // 更新下划线样式
    updateLineStyle() {
      if (!this.tabItemRects.length || !this.activeTabId) {
        this.lineStyle = { width: "0px", transform: "translateX(0px)" };
        return;
      }

      const activeItem = this.tabItemRects.find(
        (item) => item.id === `tab-item-${this.activeTabId}`,
      );
      if (activeItem) {
        const lineWidth = activeItem.width * 0.6;
        // 计算下划线中心点与 tabs-list 左边的距离
        // activeItem.left 是相对于当前视口的距离，减去 tabsListOffsetLeft 得到相对于 tabs-list 的距离
        const lineLeft =
          activeItem.left -
          this.tabsListOffsetLeft +
          activeItem.width / 2 -
          lineWidth / 2;

        this.lineStyle = {
          width: `${lineWidth}px`,
          transform: `translateX(${lineLeft}px)`,
        };
      }
    },
    // 滚动到中心位置
    scrollToCenter() {
      if (
        !this.tabItemRects.length ||
        !this.activeTabId ||
        !this.scrollViewWidth ||
        !this.tabsListOffsetLeft
      ) {
        return;
      }

      const activeItem = this.tabItemRects.find(
        (item) => item.id === `tab-item-${this.activeTabId}`,
      );
      if (activeItem) {
        // 计算 Tab 项的中心点相对于 scroll-view 可滚动区域左侧的距离
        // activeItem.left 是 Tab 项相对于视口的左侧距离
        // tabsListOffsetLeft 是 tabs-list 相对于视口的左侧距离
        // activeItem.left - this.tabsListOffsetLeft 得到 Tab 项相对于 tabs-list 起始点的距离
        const itemPositionInScroll = activeItem.left - this.tabsListOffsetLeft;
        const itemCenterInScroll = itemPositionInScroll + activeItem.width / 2;

        // 目标滚动位置：Tab 项中心点 - scroll-view 宽度的一半
        let targetScrollLeft = itemCenterInScroll - this.scrollViewWidth / 2;

        // 边界处理：防止滚动超出左右边界
        // scroll-view 的总内容宽度 (最后一个 Tab 项的右侧相对于 tabs-list 起始点)
        const contentWidth =
          this.tabItemRects[this.tabItemRects.length - 1].right -
          this.tabsListOffsetLeft;

        // 最小滚动位置（通常是 0）
        targetScrollLeft = Math.max(0, targetScrollLeft);
        // 最大滚动位置：内容总宽度 - scroll-view 可视宽度
        targetScrollLeft = Math.min(
          targetScrollLeft,
          contentWidth - this.scrollViewWidth,
        );

        // 设置 scrollLeft
        this.scrollLeft = targetScrollLeft;
      }
    },
    // 选择 Tab
    selectTab(item, fromExpanded = false) {
      if (this.activeTabId === item.id) {
        if (fromExpanded && this.isExpanded) {
          this.isExpanded = false;
        }
        return;
      }
      this.activeTabId = item.id;

      if (fromExpanded && this.isExpanded) {
        this.isExpanded = false;
      }

      // 触发事件给父组件
      // this.$emit("change", item);
    },
    // 切换展开/收起状态
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style scoped lang="scss">
.swipe-tabs-container {
  width: 100%;
  // background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  /* H5 顶部固定适配安全区 */
  position: sticky;
  top: var(--window-top, 0);
  z-index: 999; /* 确保整个组件在页面内容上方 */
}

.tabs-wrapper {
  /* 关键：设置为相对定位，作为 expand-btn 的定位上下文 */
  position: relative;
  display: flex;
  align-items: center;
  height: 80rpx;
  // background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 1000; /* 确保整个 Tab 区域在最上层 */
}

.tabs-scroll-view {
  flex: 1;
  height: 100%;
  white-space: nowrap;
  /* 调整右侧内边距，为 expand-btn 留出空间，避免内容被遮挡 */
  padding-right: 80rpx; /* expand-btn 宽度是 80rpx，这里预留空间 */
  box-sizing: border-box; /* 确保 padding 包含在 flex: 1 的宽度内 */
}

/* #ifdef H5 */
// 通过样式穿透，隐藏H5下，scroll-view下的滚动条
scroll-view ::v-deep ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* #endif */

.tabs-list {
  position: relative; /* 用于下划线定位 */
  height: 100%;
  display: flex; /* 让 Tab 项横向排列 */
  align-items: center;
  /* 移除这里的 padding-right，因为 scroll-view 已经处理 */
}

.tab-item {
  display: inline-flex; /* 让 Tab 项可以水平滚动 */
  align-items: center;
  justify-content: center;
  padding: 0 32rpx; /* 增加左右内边距，让文字不那么挤 */
  height: 100%;
  font-size: 30rpx; /* 字体稍微大一点 */
  color: #666;
  transition:
    color 0.3s,
    font-weight 0.3s,
    transform 0.1s; /* 精细控制过渡 */
  position: relative;
  white-space: nowrap; /* 确保不换行 */
  flex-shrink: 0; /* 防止被压缩 */
}

.tab-item.active {
  color: #007aff; /* 选中 Tab 颜色 */
  font-weight: bold; /* 加粗 */
}

.tab-item:hover {
  /* H5端鼠标悬停效果 */
  color: #007aff;
}
.tab-item:active {
  /* 手机端点击时的效果 */
  transform: scale(0.98); /* 点击时轻微缩小，提供按压感 */
  opacity: 0.9;
}

.tab-line {
  position: absolute;
  bottom: 0; /* 贴合 Tab 项底部 */
  left: 0;
  height: 6rpx; /* 下划线高度增加，更醒目 */
  background-color: #007aff; /* 下划线颜色与选中 Tab 颜色一致 */
  border-radius: 3rpx; /* 圆角，更柔和 */
  transition:
    transform 0.3s ease-in-out,
    width 0.3s ease-in-out; /* 动画过渡 */
}

/* 展开/收起按钮 */
.expand-btn {
  width: 80rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: #FFFFFF;
  /* 调整阴影，使其在左侧更明显，增加层次感 */
  box-shadow: -6rpx 0 8rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  /* 关键：绝对定位到右侧，并确保高 z-index */
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1001; /* 确保比 tabs-wrapper 和 scroll-view 都高 */
}

.expand-btn:active {
  background-color: #f0f0f0;
}

.arrow {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-top: 10rpx solid #666;
  transition: transform 0.3s ease-in-out;
}

.arrow-up {
  transform: rotate(180deg);
}

/* 下拉展开面板 */
.tabs-expanded-panel {
  background-color: #ffffff;
  padding: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  position: absolute; /* 让其浮动在内容之上 */
  width: 100%;
  left: 0;
  z-index: 998; /* 比 tabs-wrapper 低，但比页面内容高 */
  box-sizing: border-box;
}

.tabs-expanded-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(180rpx, 1fr)
  ); /* 自动填充，每列最小180rpx */
  gap: 20rpx; /* 网格间距 */
}

.tab-item-expanded {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx; /* 增加高度，更容易点击 */
  border: 1rpx solid #e0e0e0; /* 更柔和的边框颜色 */
  border-radius: 12rpx; /* 增加圆角 */
  font-size: 28rpx;
  color: #666;
  background-color: #f9f9f9;
  transition: all 0.2s ease-out; /* 更快的过渡 */
}

.tab-item-expanded.active {
  border-color: #007aff;
  color: #007aff;
  background-color: #e6f7ff; /* 浅蓝色背景，与主题色搭配 */
  font-weight: bold;
}

.tab-item-expanded:active {
  /* 下拉 Tab 点击效果 */
  transform: scale(0.95);
  opacity: 0.9;
}

.content-placeholder {
  padding: 20rpx;
  min-height: 200rpx; /* 示例内容区 */
  background-color: #f4f4f4;
}
</style>
