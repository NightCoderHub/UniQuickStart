<template>
  <view
    class="custom-nav-bar"
    :style="{ height: totalHeight + 'px', backgroundColor: bgColor }"
  >
    <view
      class="status-bar-placeholder"
      :style="{ height: statusBarHeight + 'px' }"
    ></view>
    <view class="nav-bar-content" :style="{ height: navBarHeight + 'px' }">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "CustomNavBar",
  props: {
    // 导航栏背景颜色
    bgColor: {
      type: String,
      default: "transparent", // 默认透明
    },
  },
  data() {
    return {
      statusBarHeight: 0, // 状态栏高度
      navBarHeight: 44, // 导航栏高度（iOS 默认 44px, Android 默认 48px，这里取通用值）
      totalHeight: 0, // 总高度
    };
  },
  created() {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();

    // 1. 获取状态栏高度
    this.statusBarHeight = systemInfo.statusBarHeight || 0;

    // 2. 动态计算导航栏高度
    // #ifdef MP-WEIXIN
    // 微信小程序胶囊按钮高度
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    if (menuButtonInfo) {
      // 导航栏高度 = 胶囊按钮高度 + (顶部高度 - 状态栏高度 - 胶囊顶部高度) * 2
      this.navBarHeight =
        menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2;
    }
    // #endif

    // #ifdef H5 || APP-PLUS
    // H5和APP端，导航栏高度通常是固定值
    this.navBarHeight = systemInfo.osName === "ios" ? 44 : 48;
    // #endif

    // 3. 计算总高度
    this.totalHeight = this.statusBarHeight + this.navBarHeight;
  },
};
</script>

<style scoped>
.custom-nav-bar {
  /* 确保组件在页面顶部并固定 */

  /* position: fixed; */
  top: 0;
  left: 0;
  z-index: 999; /* 确保层级在内容之上 */
  width: 100%;
}

.status-bar-placeholder {
  width: 100%;
}

.nav-bar-content {
  box-sizing: border-box; /* 包含 padding 和 border */
  display: flex;
  align-items: center;
  width: 100%;

  /* 导航栏内容的自定义样式，可根据需求修改 */
  padding: 0 15px; /* 左右内边距 */
}
</style>
