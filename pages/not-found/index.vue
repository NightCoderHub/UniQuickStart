<template>
  <view class="not-found-page">
    <text class="title">404</text>
    <text class="desc">页面不存在</text>
  </view>
</template>

<script setup></script>

<style lang="scss" scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f9ff;
}

.title {
  font-size: 72rpx;
  font-weight: 700;
  color: #2b3551;
}

.desc {
  font-size: 30rpx;
  color: #7f8aa7;
}
</style>
