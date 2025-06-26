<template>
  <view class="horizontal-tab-scroll">
    <view class="tab-container">
      <scroll-view
        class="horizontal-scroll"
        scroll-x="true"
        :scroll-with-animation="true"
        :scroll-left="scrollLeft"
      >
        <view class="item-container">
          <view
            v-for="(item, index) in tabs"
            :id="'item-' + index"
            :key="index"
            class="scroll-item"
            :class="{ active: activeIndex === index }"
            @click="selectTab(index, item)"
          >
            {{ item.text }}
          </view>
        </view>
      </scroll-view>

      <view class="dropdown-btn" @click="toggleDropdown">
        <text class="icon" :class="{ rotated: isDropdownVisible }">▼</text>
      </view>
    </view>

    <view
      :class="{ show: isDropdownVisible }"
      class="dropdown-overlay"
      @click="toggleDropdown"
    >
      <view class="dropdown-content" @click.stop="">
        <!-- <view class="dropdown-header">全部频道</view> -->
        <view
          v-for="(item, index) in tabs"
          :key="index"
          class="dropdown-item"
          :class="{ active: activeIndex === index }"
          @click="selectAndCloseDropdown(index, item)"
        >
          {{ item.text }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "HorizontalTabScroll",
  props: {
    tabs: {
      type: Array,
      default: () => [],
    },
    defaultIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ["tab-change"],

  data() {
    return {
      // ** 替换 scroll-into-view，使用 scrollLeft 精确控制 **
      scrollLeft: 0,
      activeIndex: this.defaultIndex,
      isDropdownVisible: false,

      // 存储 Tab 项的尺寸和位置信息
      itemRects: [],
      // scroll-view 容器的宽度
      scrollViewWidth: 0,
    };
  },

  watch: {
    // 监听 props 的变化
    defaultIndex(newVal) {
      this.activeIndex = newVal;
      // 当 defaultIndex 变化时，重新滚动到居中位置
      this.$nextTick(() => {
        this.scrollToCenter(newVal);
      });
    },
    tabs: {
      handler() {
        // 数据更新后，重新获取元素尺寸
        this.$nextTick(() => {
          this.getItemRects();
        });
      },
      deep: true,
    },
  },

  // 组件挂载后，获取元素尺寸
  mounted() {
    this.$nextTick(() => {
      this.getItemRects();
    });
  },

  methods: {
    /**
     * 选择 Tab 并触发滚动
     * @param {number} index - 被点击项的索引
     * @param {object} item - 被点击项的数据
     */
    selectTab(index, item) {
      this.activeIndex = index;

      // ** 调用居中滚动方法 **
      this.scrollToCenter(index);
      if (this.isDropdownVisible) this.isDropdownVisible = false;
      // 派发自定义事件，通知父组件
      this.$emit("tab-change", {
        index: index,
        item: item,
      });
    },

    /**
     * 精确计算并滚动到居中位置
     * @param {number} index - 目标项的索引
     */
    scrollToCenter(index) {
      if (this.itemRects.length === 0 || this.scrollViewWidth === 0) {
        // 如果数据还没准备好，延迟执行
        console.warn("Tab 尺寸信息尚未获取，居中滚动功能暂不可用。");
        return;
      }

      // 获取目标 Tab 项的尺寸和位置
      const targetItem = this.itemRects[index];
      if (!targetItem) return;

      // 计算需要滚动的距离
      // 目标位置 = 目标元素左侧距离 - (scroll-view 宽度 / 2) + (目标元素宽度 / 2)
      // 这样计算出的 scroll-left 值，就能让目标元素的中心对齐 scroll-view 的中心
      const targetScrollLeft =
        targetItem.left - this.scrollViewWidth / 2 + targetItem.width / 2;

      // 更新 scrollLeft，触发滚动
      this.scrollLeft = targetScrollLeft;
    },

    /**
     * 获取 scroll-view 和 Tab 项的尺寸和位置信息
     */
    getItemRects() {
      // 使用 uni.createSelectorQuery() 获取元素信息
      const query = uni.createSelectorQuery().in(this);

      // 获取 scroll-view 容器的宽度
      query
        .select(".horizontal-scroll")
        .boundingClientRect((data) => {
          if (data) {
            this.scrollViewWidth = data.width;
          }
        })
        .exec();

      // 获取所有 Tab 项的位置信息
      query
        .selectAll(".scroll-item")
        .boundingClientRect()
        .exec((data) => {
          if (data && data[1]) {
            // 确保数据存在
            this.itemRects = data[1];
            // 初始化时滚动到默认位置
            this.scrollToCenter(this.activeIndex);
          }
        });
    },

    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },

    selectAndCloseDropdown(index, item) {
      this.selectTab(index, item);
      this.isDropdownVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
/* 组件根容器 */
.horizontal-tab-scroll {
  width: 100%;
  position: relative;
}

/* Tab 栏容器，用于定位下拉按钮 */
.tab-container {
  background-color: $background-color-content;
  // box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  position: relative;
  // ** 将 position: relative; 放在这里，让 dropdown-overlay 可以在其内部定位 **
  // height: 120rpx;
  // padding-top: 24rpx;
}

/* 横向滚动的 scroll-view */
.horizontal-scroll {
  width: calc(100% - 80rpx);
  // height: 80rpx;
  white-space: nowrap;
  box-sizing: border-box;
}

/* Tab 项容器 */
.item-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 0 10rpx;
  box-sizing: border-box;
  height: 100rpx;
}

/* Tab 项样式 */
.scroll-item {
  padding: 0 16rpx;
  height: 44rpx;
  line-height: 44rpx;
  flex-shrink: 0;
  margin: 0 10rpx;
  border-radius: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  color: #828282;
  border: 2rpx solid transparent;
  transition: all 0.2s ease; /* 添加过渡效果 */
  &:active {
    opacity: 0.7; /* 点击反馈 */
  }
}
/* 选中项样式 */
.scroll-item.active {
  border-color: $color-success;
  color: $color-success;
  font-weight: normal;
}

/* ================== 下拉按钮样式 ================== */
.dropdown-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: $background-color-content;
  box-shadow: -4rpx 0 8rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.dropdown-btn .icon {
  font-size: 28rpx;
  color: #999;
  transition: transform 0.3s ease;
}

.dropdown-btn .icon.rotated {
  transform: rotate(180deg);
}

/* ================== 优化后的下拉列表样式 ================== */
.dropdown-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 9; /* z-index 略低于 Tab 栏，避免遮挡 */

  // ** 动画效果关键样式 **
  max-height: 0; // 初始隐藏状态
  opacity: 0; // 初始透明度
  overflow: hidden; // 隐藏溢出内容
  transition:
    max-height 0.25s ease-in-out,
    opacity 0.25s ease-in-out; // 添加过渡
}

/* 动画展开状态 */
.dropdown-overlay.show {
  max-height: 50vh; // 展开后足够大的高度，确保内容完全显示
  opacity: 1; // 展开后完全显示
  overflow-y: auto;
}

.dropdown-content {
  width: 100%;
  box-sizing: border-box;
  // background-color: $background-color-content;
  background-color: #fff;
  border-radius: 0 0 20rpx 20rpx;
  padding: 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  box-shadow: 0 6rpx 6rpx rgba(0, 0, 0, 0.05);
}

.dropdown-header {
  width: 100%;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.dropdown-item {
  width: 25%;
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
  transition: all 0.2s ease;
  &:active {
    background-color: #f5f5f5; /* 点击反馈 */
  }
}
.dropdown-item.active {
  color: $color-success;
  font-weight: bold;
}
</style>
