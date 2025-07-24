<template>
  <view class="search-container">
    <view class="search-section">
      <view class="search-input-container">
        <text class="iconfont icon-sousuo search-icon"></text>
        <input
          v-if="isEnabled"
          v-model="searchValue"
          class="search-input"
          type="text"
          placeholder="输入服务内容"
          placeholder-style="color: #3D3D3D"
          confirm-type="搜索"
          @confirm="handleSearch"
        />
        <view
          v-else
          class="search-input view-input"
          :style="{ color: searchValue ? '#333' : '#3D3D3D' }"
          @click="handleComponentClick"
        >
          {{ searchValue || "输入服务内容" }}
        </view>
      </view>
      <view class="search-suffix">
        <text class="iconfont icon-saoyisao qr-icon" @click="scanQR"></text>
        <image class="ai-tag" src="/static/ai.png" @click="scanQR"></image>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["click"],
  methods: {
    handleComponentClick() {
      console.log(22);
      // 组件被点击时触发自定义事件
      this.$emit("click", { type: "component-click" });
    },
    scanQR() {
      console.log("扫描二维码");
      this.$devToast();
    },
    handleSearch() {
      if (!this.isEnabled) return;
      if (this.searchValue.trim()) {
        console.log("搜索内容:", this.searchValue);
        // this.$emit('search', this.searchValue);
      } else {
        uni.showToast({
          title: "请输入搜索内容",
          icon: "none",
          duration: 2000,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.search-container {
  padding: 0 24rpx;
  background-color: #fff;
}

.search-section {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
}

.search-input-container {
  // background-color: #f5f5f5;

  display: flex;
  flex: 1;
  align-items: center;
  // padding: 0 24rpx;
}

.search-icon {
  margin-right: 16rpx;
  font-size: 32rpx;
  color: #000;
}

.search-input {
  flex: 1;
  // height: 100%;
  height: 64rpx;
  font-size: 28rpx;
  line-height: 64rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

/* 添加禁用状态样式 */
.search-input:disabled {
  pointer-events: none;
  // color: #999;
  // -webkit-text-fill-color: #999;
}

.search-suffix {
  z-index: 1;
  display: flex;
  gap: 20rpx;
  align-items: center;
  margin-left: auto; // 使用margin-left:auto实现右对齐
}

.qr-icon {
  font-size: 40rpx;
  color: #000;

  /* 禁用状态样式 */
  // opacity: v-bind(isEnabled ? 1: 0.5);
}

.ai-tag {
  width: 40rpx;
  height: 40rpx;

  /* 禁用状态样式 */
  // opacity: v-bind(isEnabled ? 1: 0.5);
}
</style>
