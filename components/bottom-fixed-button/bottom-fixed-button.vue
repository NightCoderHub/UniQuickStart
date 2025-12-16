<template>
  <view>
    <view v-if="fixed" class="placeholder" :class="`placeholder--${size}`"></view>
    <view class="base-button-wrapper" :class="{ 'fixed-bottom-container': fixed }">
      <view
        class="gradient-button"
        :class="[buttonClass, { 'is-disabled': disabled, 'is-loading': loading }]"
        @click="handleClick"
      >
        <template v-if="loading">
          <view class="loading-icon">
            <wd-loading size="40rpx" />
          </view>
          <slot>立即购买</slot>
        </template>
        <template v-else>
          <slot>立即购买</slot>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

// --- Props & Emits ---
const emit = defineEmits(["click"]);

const props = defineProps({
  /**
   * 是否固定在页面底部。为 false 时，组件将作为普通块级元素渲染。
   */
  fixed: {
    type: Boolean,
    default: true,
  },
  /**
   * 按钮尺寸: 可选 'medium' (默认) 或 'large'
   */
  size: {
    type: String,
    default: "medium",
    validator: (value) => ["medium", "large"].includes(value),
  },
  /**
   * 禁用状态：禁用时阻止点击事件，改变样式
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 加载状态：显示加载图标，阻止点击事件
   */
  loading: {
    type: Boolean,
    default: false,
  },
});

// --- 逻辑 ---
const buttonClass = computed(() => `button--${props.size}`);

const handleClick = (e) => {
  if (props.disabled || props.loading) {
    return;
  }
  emit("click", e);
};
</script>

<style lang="scss" scoped>
.placeholder {
  width: 100%;

  &--medium {
    height: calc(120rpx + constant(safe-area-inset-bottom));
    height: calc(120rpx + env(safe-area-inset-bottom));
  }

  &--large {
    height: calc(136rpx + constant(safe-area-inset-bottom));
    height: calc(136rpx + env(safe-area-inset-bottom));
  }
}

.base-button-wrapper {
  width: 100%;
  padding: 20rpx 30rpx;
}

.fixed-bottom-container {
  position: fixed;
  right: var(--window-right);
  bottom: 0;
  left: var(--window-left);
  z-index: 10;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -2rpx 10rpx rgb(0 0 0 / 5%);
}

.gradient-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #fff;
  cursor: pointer;
  background-image: $uni-bg-linear-gradient;
  box-shadow: 0 12rpx 24rpx rgb(44 117 234 / 20%);
  opacity: 1;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.button--medium {
  height: 80rpx;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 40rpx;
}

.button--large {
  height: 96rpx;
  font-size: 34rpx;
  font-weight: 600;
  border-radius: 48rpx;
}

.is-disabled {
  pointer-events: none;
  background-image: linear-gradient(135deg, #a0cfff 0%, #8ab5ff 100%);
  box-shadow: 0 12rpx 24rpx rgb(138 181 255 / 20%);
  opacity: 1;

  &:active {
    opacity: 1;
  }
}

.is-loading {
  pointer-events: none;
  opacity: 0.8;

  .loading-icon {
    margin-right: 10rpx;
  }
}
</style>
