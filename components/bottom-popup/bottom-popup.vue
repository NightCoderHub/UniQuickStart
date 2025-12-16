<template>
  <wd-popup
    :model-value="visible"
    position="bottom"
    :close-on-click-modal="true"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    v-bind="$attrs"
    :custom-class="`popup-content-wrapper ${$attrs['custom-class'] || ''}`"
    custom-style="border-radius: 24rpx 24rpx 0 0; background-color: #f7f8fa;"
    @update:model-value="handleUpdateVisible"
    @close="handlePopupClose"
  >
    <view class="popup-content">
      <view class="popup-header">
        <view class="white-space"></view>

        <slot name="header">
          <view class="title">{{ title || "请选择" }}</view>
        </slot>
        <view class="close" @click="close">
          <image src="/static/popup-close-icon.png" class="close-icon"></image>
        </view>
      </view>

      <view class="popup-body" :style="bodyStyle">
        <slot>
          <view class="default-body-tip">请通过插槽添加主体内容</view>
        </slot>
      </view>

      <view class="popup-footer">
        <slot name="footer">
          <wd-button type="info" block @click="close"> 关闭 </wd-button>
        </slot>
      </view>
    </view>
  </wd-popup>
</template>

<script setup>
import { computed } from "vue";

// 定义 Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  // 用于控制中部区域的高度，默认为空
  bodyHeight: {
    type: [String, Number], // 允许传入字符串 (如 '50vh') 或数字 (如 300)
    default: "",
  },
  // 是否开启底部安全区适配
  safeAreaInsetBottom: {
    type: Boolean,
    default: true,
  },
});

// 定义 Emits
const emit = defineEmits(["update:visible", "close"]);

// 处理可见性更新
const handleUpdateVisible = (val) => {
  emit("update:visible", val);
};

// 手动关闭弹窗的逻辑（点击关闭按钮）
const close = () => {
  emit("update:visible", false);
  emit("close");
};

// 监听 popup 组件的关闭事件（如点击遮罩层关闭）
const handlePopupClose = () => {
  emit("close");
};

// 使用 computed 属性动态计算样式对象
const bodyStyle = computed(() => {
  const heightValue = props.bodyHeight;

  if (!heightValue) {
    return {}; // 如果没有设置高度，则返回空对象，使用 CSS 默认 flex 布局
  }

  // 确保高度值带有单位，如果传入的是纯数字，我们默认为 'px'
  const finalHeight = typeof heightValue === "number" || /^\d+$/.test(heightValue) ? `${heightValue}px` : heightValue;

  return {
    height: finalHeight,
    // 覆盖默认的 flex: 1，强制使用固定高度
    flex: "none",
  };
});
</script>

<style lang="scss" scoped>
.popup-content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
  background-color: #fff;

  /* 确保背景色 */
}

/* --- 头部样式 --- */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .white-space {
    width: 60rpx;
    height: 60rpx;
  }

  .title {
    font-size: 30rpx;
    font-weight: 700;
    color: #333;
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgb(0 0 0 / 5%);
    }

    .close-icon {
      width: 40rpx;
      height: 40rpx;
    }
  }
}

/* --- 中部/内容样式 --- */
.popup-body {
  /* 当 bodyHeight 为空时，flex: 1 会生效 */
  flex: 1;
  padding: 15px;
  overflow-y: auto;

  /* 保证内容溢出时可以滚动 */
}

/* --- 底部样式 --- */
.popup-footer {
  flex-shrink: 0;
  padding: 10px 15px;

  /* 调整底部padding，配合 safeAreaInsetBottom */
  border-top: 1px solid #eee;

  /* 确保底部不被压缩 */
}
</style>
