<template>
  <view
    class="muqian-content"
    :style="{
      width,
      height,
    }"
    @click="handleClick"
  >
    <image
      :src="loadSrc"
      class="muqian-image muqian-load"
      :mode="mode"
      :style="{
        opacity: isShow ? '0' : '1',
        borderRadius,
        width: '100%',
        height: '100%',
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
      @load="handleLoadInit"
    ></image>

    <image
      v-if="status == 1"
      class="muqian-image"
      :src="src"
      :mode="mode"
      :style="{
        opacity: isShow ? '1' : '0',
        borderRadius,
        width: '100%',
        height: '100%',
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
      @load="handleLoadSuccess"
      @error="handleLoadError"
    >
    </image>
    <image
      v-if="status == 2"
      class="muqian-image"
      :src="errorSrc"
      :mode="mode"
      :style="{
        opacity: isShow ? '1' : '0',
        borderRadius,
        width: '100%',
        height: '100%',
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
    >
    </image>
  </view>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, getCurrentInstance } from "vue";
import loadingImage from "@/static/loading.png";
import loadFailImage from "@/static/loadFail.png";
// 获取当前组件实例
const { proxy } = getCurrentInstance();
// 定义 props
const props = defineProps({
  mode: {
    type: String,
    default: "scaleToFill",
  },
  borderRadius: {
    type: String,
    default: "8rpx",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  src: {
    type: String,
    default: "",
  },
  minTimeOut: {
    type: [String, Number],
    default: 300,
  },
  showDistance: {
    type: Object,
    default: () => ({ bottom: 20 }),
  },
  effect: {
    type: String,
    default: "linear",
  },
  duration: {
    type: [String, Number],
    default: 300,
  },
  loadSrc: {
    type: String,
    default: loadingImage,
  },
  errorSrc: {
    type: String,
    default: loadFailImage,
  },
});

// 定义 emit
const emit = defineEmits(["show", "showSuccess", "click"]);

const handleClick = () => {
  emit("click");
};

// 响应式状态
const status = ref(0); // 0加载中 1加载成功 2加载失败
const isShow = ref(false);
let loadTimer = null;
let intersectionObserverInstance = null; // 用于存储 IntersectionObserver 实例

// 监听 src 变化重新加载
watch(
  () => props.src,
  () => {
    if (!isShow.value) return;
    status.value = 0;
    isShow.value = false;
    nextTick(() => {
      status.value = 1;
    });
  },
);

// 加载成功时的处理
const handleLoadSuccess = () => {
  if (props.minTimeOut == 0) {
    isShow.value = true;
  } else {
    let newTimer = new Date().getTime() - loadTimer;
    if (newTimer < props.minTimeOut) {
      setTimeout(() => {
        isShow.value = true;
      }, props.minTimeOut - newTimer);
    } else {
      isShow.value = true;
    }
  }

  setTimeout(() => {
    emit("showSuccess");
  }, props.duration);
};

// 加载失败时的处理
const handleLoadError = () => {
  status.value = 2;
  isShow.value = true;
};

// 初始化 IntersectionObserver
const initObserver = () => {
  // 确保在组件挂载后才创建 IntersectionObserver
  // 这里的 this.$el 在 setup 脚本中不直接可用，
  // 对于 uni-app，uni.createIntersectionObserver(this) 应该没问题，
  // 但在 setup 中，通常需要通过 ref 获取 DOM 元素或组件实例。
  // 对于你的情况，由于是监听 `.muqain-load` 类名，只要这个元素在 DOM 中即可。
  intersectionObserverInstance = uni.createIntersectionObserver(proxy); // 这里的 this 指的是当前组件实例
  let loadFlag = false; // 避免变量名冲突，使用 loadFlag

  intersectionObserverInstance.relativeToViewport(props.showDistance).observe(".muqian-load", (res) => {
    if (!loadFlag && res.intersectionRatio == 0) {
      loadFlag = true;
      return;
    }
    emit("show"); // 触发 show 事件
    loadFlag = true;
    status.value = 1; // 更新状态
    loadTimer = new Date().getTime();
    intersectionObserverInstance.disconnect(); // 第一次进入视图后立即断开监听
  });
};

// 在组件挂载时调用 initObserver
onMounted(() => {
  initObserver();
});

// 处理加载中图片的 @load 事件 (init 方法的替代)
const handleLoadInit = () => {
  // 在这里，我们可以认为加载中图片成功加载后，组件已经准备好进行懒加载逻辑
  // 实际的 IntersectionObserver 已经由 onMounted 中的 initObserver 设置
  // 这里的 @load 事件可能不是 init 方法的全部意图，但它是一个触发点
  // 原始代码中 `init` 的主要作用是创建 `intersectionObserver` 并设置监听。
  // 在 Composition API 中，这部分逻辑应在 `onMounted` 中处理。
};

// 组件卸载时清理 IntersectionObserver
onUnmounted(() => {
  if (intersectionObserverInstance) {
    intersectionObserverInstance.disconnect();
    intersectionObserverInstance = null; // 确保清理引用
  }
});
</script>

<style lang="scss" scoped>
/* 你的样式保持不变 */
.muqian-content {
  position: relative;
  overflow: hidden;

  .muqian-image {
    display: block;
    will-change: transform;
  }

  .muqian-load {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
