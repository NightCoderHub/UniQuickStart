<template>
  <view :class="['safe-area-footer-wrapper', { 'is-fixed': fixed }]">
    <view ref="footerContent" class="safe-area-footer-content">
      <slot></slot>
      <view v-if="!disableSafeArea" class="safe-area-inset-bottom"></view>
    </view>

    <view
      v-if="fixed"
      class="safe-area-footer-placeholder"
      :style="{ height: placeholderHeight }"
    ></view>
  </view>
</template>

<script setup>
import {
  defineProps,
  ref,
  onMounted,
  nextTick,
  computed,
  watch,
  getCurrentInstance,
} from "vue";

const props = defineProps({
  /**
   * 是否将组件固定在底部
   * @type {boolean}
   * @default true
   */
  fixed: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否禁用底部安全区适配（如果内容本身不需要适配，或已在父组件处理）
   * @type {boolean}
   * @default false
   */
  disableSafeArea: {
    type: Boolean,
    default: false,
  },
});

const footerContent = ref(null); // 用于获取实际内容的引用
const instance = getCurrentInstance();

// 存储实际内容的测量高度（不含安全区）
const contentActualHeight = ref(0);

// 测量并更新高度
const measureHeight = () => {
  nextTick(() => {
    if (!instance.proxy || !footerContent.value) return;

    uni
      .createSelectorQuery()
      .in(instance.proxy)
      .select(".safe-area-footer-content")
      .boundingClientRect((rect) => {
        if (rect) {
          // rect.height 包含了 safe-area-inset-bottom 的高度
          // 也就是说，它测量的是 footerContent 整体的高度
          contentActualHeight.value = rect.height;
          // console.log('SafeAreaFooter 总高度 (包含安全区):', rect.height, 'px');
        }
      })
      .exec();
  });
};

// 监听 props.fixed 变化和 contentActualHeight 变化
onMounted(() => {
  measureHeight(); // 初始测量
});

// 可以在需要时（比如内容动态变化）手动调用 measureHeight()
// 或者如果 slot 内容是动态的，你可能需要更复杂的 MutationObserver
// 但对于大多数固定底部按钮场景，onMounted 测量一次就够了。
// 这里我们监听 fixed 属性，因为切换固定/非固定状态可能影响高度计算（虽然不应该）
watch(
  () => props.fixed,
  () => {
    measureHeight();
  },
);

// 计算占位元素需要的高度 (总高度，包含安全区)
const placeholderHeight = computed(() => {
  return `${contentActualHeight.value}px`;
});

// 通过 expose 暴露占位高度，供父组件获取（如果父组件需要的话）
// expose({
//   placeholderHeight
// });
</script>

<style lang="scss" scoped>
.safe-area-footer-wrapper {
  width: 100%;
  // 当不固定时，作为普通流式布局的容器
}

.safe-area-footer-content {
  width: 100%;
  // 确保内容有背景色，防止透视
  background-color: #fff;
  // 默认情况下，自身内容会撑开高度

  .safe-area-inset-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.safe-area-footer-wrapper.is-fixed {
  .safe-area-footer-content {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  }

  .safe-area-footer-placeholder {
    /*
				这是一个不可见的占位元素，当 .safe-area-footer-content 固定时，
				它依然在文档流中占据空间，防止页面内容被遮挡。
				高度由 JS 动态计算。
			*/
    width: 100%;
    // min-height: 1px; /* 防止高度为 0 时不渲染 */
  }
}
</style>
