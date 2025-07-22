<template>
  <view :style="{ height: statusBarHeight + 'px' }"></view>
</template>

<script setup>
import { ref } from "vue";

const statusBarHeight = ref(0);

// 在组件 setup 阶段同步获取
statusBarHeight.value = uni.getWindowInfo().statusBarHeight;
</script>

<style scoped>
/* 可以在这里添加额外的样式，例如背景色 */
/* view {
  background-color: #f0f0f0;
} */
</style>
