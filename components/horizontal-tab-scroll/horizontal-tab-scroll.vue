<template>
  <view class="horizontal-tab-scroll">
    <view class="tab-container">
      <scroll-view
        class="horizontal-scroll"
        scroll-x="true"
        :scroll-with-animation="true"
        :scroll-into-view="toView"
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
        <text class="icon">{{ isDropdownVisible ? "▲" : "▼" }}</text>
      </view>
    </view>

    <view v-if="isDropdownVisible" class="dropdown-overlay">
      <view class="dropdown-content">
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
  // 定义组件名称
  name: "HorizontalTabScroll",

  // 接受父组件传递的 props
  props: {
    // 必传的 tabs 数组，包含 { text: '...' } 等对象
    tabs: {
      type: Array,
      default: () => [],
      required: true,
    },
    // 可选的默认选中索引
    defaultIndex: {
      type: Number,
      default: 0,
    },
  },

  // 内部数据
  data() {
    return {
      // 滚动目标元素的 ID
      toView: "",
      // 当前激活项的索引
      activeIndex: this.defaultIndex,
      // 控制下拉列表的显示/隐藏
      isDropdownVisible: false,
    };
  },

  // 监听 props 的变化
  watch: {
    // 当 defaultIndex 变化时，更新内部的 activeIndex
    defaultIndex(newVal) {
      this.activeIndex = newVal;
      // 确保组件初始化时滚动到默认位置
      this.toView = "item-" + newVal;
    },
    // 当 tabs 数据变化时，重置选中状态
    tabs: {
      handler() {
        this.activeIndex = this.defaultIndex;
        this.toView = "item-" + this.defaultIndex;
      },
      deep: true,
    },
  },

  // 组件挂载后，初始化滚动位置
  mounted() {
    this.toView = "item-" + this.activeIndex;
  },

  methods: {
    /**
     * 选择 Tab 并触发滚动
     * @param {number} index - 被点击项的索引
     * @param {object} item - 被点击项的数据
     */
    selectTab(index, item) {
      // 更新激活项的索引，用于高亮显示
      this.activeIndex = index;

      // 设置 scroll-into-view 的值，触发滚动
      this.toView = "item-" + index;

      // 派发自定义事件，通知父组件
      // 使用 this.$emit('事件名', '参数')
      this.$emit("tab-change", {
        index: index,
        item: item,
      });
    },

    /**
     * 切换下拉列表的显示状态
     */
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },

    /**
     * 在下拉列表中选择一个 Tab，并关闭列表
     * @param {number} index - 被选择项的索引
     * @param {object} item - 被选择项的数据
     */
    selectAndCloseDropdown(index, item) {
      this.selectTab(index, item); // 调用 selectTab 触发滚动和事件派发
      this.isDropdownVisible = false; // 关闭下拉列表
    },
  },
};
</script>

<style scoped>
/* 组件根容器 */
.horizontal-tab-scroll {
  width: 100%;
}

/* Tab 栏容器，用于定位下拉按钮 */
.tab-container {
  background-color: #fff;
  padding: 10rpx 0;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  position: relative; /* 关键：为下拉按钮提供定位上下文 */
}

/* 横向滚动的 scroll-view */
.horizontal-scroll {
  /* 减去下拉按钮的宽度，确保其不被遮挡 */
  width: calc(100% - 80rpx);
  height: 80rpx;
  white-space: nowrap;
  box-sizing: border-box;
}

/* Tab 项容器 */
.item-container {
  display: flex;
  flex-direction: row;
  padding: 0 10rpx;
  box-sizing: border-box;
}

/* Tab 项样式 */
.scroll-item {
  min-width: 120rpx;
  height: 60rpx;
  flex-shrink: 0;
  padding: 0 20rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

/* 选中项样式 */
.scroll-item.active {
  background-color: #007aff;
  color: #fff;
  font-weight: bold;
  transform: scale(1.05);
}

/* ================== 下拉按钮样式 ================== */
.dropdown-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute; /* 绝对定位 */
  right: 0;
  top: 0;
  background-color: #fff;
  box-shadow: -4rpx 0 8rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.dropdown-btn .icon {
  font-size: 28rpx;
  color: #999;
}

/* ================== 下拉列表样式 ================== */
.dropdown-overlay {
  position: fixed; /* 固定定位，覆盖全屏 */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dropdown-content {
  width: 90%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  overflow-y: auto;
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
}

.dropdown-item.active {
  color: #007aff;
  font-weight: bold;
}
</style>
