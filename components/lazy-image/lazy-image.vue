<template>
  <view
    class="lazy-image-container"
    :style="{
      width,
      height,
    }"
  >
    <image
      :src="loadSrc"
      class="lazy-image lazy-image-placeholder"
      :mode="mode"
      :style="{
        opacity: isShow ? '0' : '1',
        borderRadius,
        width,
        height,
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
      @load="handleLoadInit"
    ></image>

    <image
      v-if="status == 1"
      class="lazy-image"
      :src="src"
      :mode="mode"
      :style="{
        opacity: isShow ? '1' : '0',
        borderRadius,
        width,
        height,
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
      @load="handleLoadSuccess"
      @error="handleLoadError"
    >
    </image>
    <image
      v-if="status == 2"
      class="lazy-image"
      :src="errorSrc"
      :mode="mode"
      :style="{
        opacity: isShow ? '1' : '0',
        borderRadius,
        width,
        height,
        transition: `opacity ${duration / 1000}s ${effect}`,
      }"
    >
    </image>
  </view>
</template>

<script setup>
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  getCurrentInstance,
} from "vue";
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
    default: 100,
  },
  showDistance: {
    type: Object,
    default: () => ({ bottom: 0 }),
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
const emit = defineEmits(["show", "showSuccess"]);

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
  intersectionObserverInstance = uni.createIntersectionObserver(proxy);
  let loadFlag = false;

  intersectionObserverInstance
    .relativeToViewport(props.showDistance)
    .observe(".lazy-image-placeholder", (res) => {
      if (!loadFlag && res.intersectionRatio == 0) {
        loadFlag = true;
        return;
      }
      emit("show");
      loadFlag = true;
      status.value = 1;
      loadTimer = new Date().getTime();
      intersectionObserverInstance.disconnect();
    });
};

// 在组件挂载时调用 initObserver
onMounted(() => {
  initObserver();
});

// 处理加载中图片的 @load 事件 (init 方法的替代)
const handleLoadInit = () => {};

// 组件卸载时清理 IntersectionObserver
onUnmounted(() => {
  if (intersectionObserverInstance) {
    intersectionObserverInstance.disconnect();
    intersectionObserverInstance = null;
  }
});
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;

  .lazy-image {
    display: block;
    will-change: transform;
  }

  .lazy-image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
