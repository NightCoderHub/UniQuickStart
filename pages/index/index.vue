<template>
  <view class="page">
    <view class="container">
      <view class="section-title text-center">Utilities 工具类展示</view>

      <!-- 间距工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">间距工具类</view>

        <!-- Margin 示例 -->
        <view class="demo-label">Margin 间距</view>
        <view class="demo-row">
          <view class="demo-box m-0">m-0</view>
          <view class="demo-box m-xs">m-xs</view>
          <view class="demo-box m-sm">m-sm</view>
          <view class="demo-box m-base">m-base</view>
          <view class="demo-box m-lg">m-lg</view>
        </view>

        <view class="demo-row">
          <view class="demo-box mt-lg">mt-lg</view>
          <view class="demo-box mb-lg">mb-lg</view>
          <view class="demo-box ml-lg">ml-lg</view>
          <view class="demo-box mr-lg">mr-lg</view>
        </view>

        <view class="demo-row">
          <view class="demo-box mx-lg">mx-lg</view>
          <view class="demo-box my-lg">my-lg</view>
        </view>

        <!-- Padding 示例 -->
        <view class="demo-label">Padding 内边距</view>
        <view class="demo-row">
          <view class="demo-box-outline p-0">p-0</view>
          <view class="demo-box-outline p-xs">p-xs</view>
          <view class="demo-box-outline p-sm">p-sm</view>
          <view class="demo-box-outline p-base">p-base</view>
          <view class="demo-box-outline p-lg">p-lg</view>
        </view>

        <view class="demo-row">
          <view class="demo-box-outline px-lg">px-lg</view>
          <view class="demo-box-outline py-lg">py-lg</view>
        </view>
      </view>

      <!-- 文本工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">文本工具类</view>

        <!-- 文本对齐 -->
        <view class="demo-label">文本对齐</view>
        <view class="demo-box text-left">text-left</view>
        <view class="demo-box text-center">text-center</view>
        <view class="demo-box text-right">text-right</view>
        <view class="demo-box text-justify"
          >text-justify 这是一段较长的文本，用于演示文本两端对齐的效果。这是一段较长的文本，用于演示文本两端对齐的效果。</view
        >

        <!-- 文本颜色 -->
        <view class="demo-label">文本颜色</view>
        <view class="demo-row">
          <view class="demo-box text-primary">text-primary</view>
          <view class="demo-box text-success">text-success</view>
          <view class="demo-box text-warning">text-warning</view>
          <view class="demo-box text-error">text-error</view>
        </view>

        <view class="demo-row">
          <view class="demo-box bg-primary text-white">text-white</view>
          <view class="demo-box text-black">text-black</view>
          <view class="demo-box text-grey">text-grey</view>
          <view class="demo-box text-placeholder">text-placeholder</view>
          <view class="demo-box text-disable">text-disable</view>
        </view>

        <!-- 文本大小 -->
        <view class="demo-label">文本大小</view>
        <view class="demo-box text-xs">text-xs</view>
        <view class="demo-box text-sm">text-sm</view>
        <view class="demo-box text-base">text-base</view>
        <view class="demo-box text-lg">text-lg</view>
        <view class="demo-box text-xl">text-xl</view>

        <!-- 文本样式 -->
        <view class="demo-label">文本样式</view>
        <view class="demo-box text-bold">text-bold</view>
        <view class="demo-box text-normal">text-normal</view>
        <view class="demo-box text-ellipsis" style="width: 200rpx">这是一段很长的文本，将被省略号截断</view>
        <view class="demo-box text-ellipsis-2" style="width: 200rpx"
          >这是一段很长的文本，将在第二行被省略号截断，这是一段很长的文本</view
        >
      </view>

      <!-- Flex 布局工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">Flex 布局工具类</view>

        <!-- Flex 方向 -->
        <view class="demo-label">Flex 方向</view>
        <view class="demo-box flex mb-sm">
          <view class="demo-item">flex 1</view>
          <view class="demo-item">flex 2</view>
          <view class="demo-item">flex 3</view>
        </view>

        <view class="demo-box flex-column mb-sm" style="height: 200rpx">
          <view class="demo-item">flex-column 1</view>
          <view class="demo-item">flex-column 2</view>
          <view class="demo-item">flex-column 3</view>
        </view>

        <!-- Flex 换行 -->
        <view class="demo-label">Flex 换行</view>
        <view class="demo-box flex flex-wrap mb-sm" style="width: 300rpx">
          <view class="demo-item">flex-wrap 1</view>
          <view class="demo-item">flex-wrap 2</view>
          <view class="demo-item">flex-wrap 3</view>
          <view class="demo-item">flex-wrap 4</view>
        </view>

        <view class="demo-box flex flex-nowrap mb-sm overflow-hidden" style="width: 300rpx">
          <view class="demo-item">flex-nowrap 1</view>
          <view class="demo-item">flex-nowrap 2</view>
          <view class="demo-item">flex-nowrap 3</view>
        </view>

        <!-- Justify Content -->
        <view class="demo-label">Justify Content</view>
        <view class="demo-box flex justify-start mb-sm">
          <view class="demo-item">start</view>
          <view class="demo-item">start</view>
        </view>

        <view class="demo-box flex justify-center mb-sm">
          <view class="demo-item">center</view>
          <view class="demo-item">center</view>
        </view>

        <view class="demo-box flex justify-end mb-sm">
          <view class="demo-item">end</view>
          <view class="demo-item">end</view>
        </view>

        <view class="demo-box flex justify-between mb-sm">
          <view class="demo-item">between</view>
          <view class="demo-item">between</view>
        </view>

        <view class="demo-box flex justify-around mb-sm">
          <view class="demo-item">around</view>
          <view class="demo-item">around</view>
        </view>

        <view class="demo-box flex justify-evenly mb-sm">
          <view class="demo-item">evenly</view>
          <view class="demo-item">evenly</view>
        </view>

        <!-- Align Items -->
        <view class="demo-label">Align Items</view>
        <view class="demo-box flex items-start mb-sm" style="height: 100rpx">
          <view class="demo-item">start</view>
          <view class="demo-item" style="height: 60rpx">start</view>
        </view>

        <view class="demo-box flex items-center mb-sm" style="height: 100rpx">
          <view class="demo-item">center</view>
          <view class="demo-item" style="height: 60rpx">center</view>
        </view>

        <view class="demo-box flex items-end mb-sm" style="height: 100rpx">
          <view class="demo-item">end</view>
          <view class="demo-item" style="height: 60rpx">end</view>
        </view>

        <view class="demo-box flex items-stretch mb-sm" style="height: 100rpx">
          <view class="demo-item" style="height: auto">stretch</view>
          <view class="demo-item" style="height: auto">stretch</view>
        </view>

        <!-- Flex 属性 -->
        <view class="demo-label">Flex 属性</view>
        <view class="demo-box flex mb-sm">
          <view class="demo-item flex-1">flex-1</view>
          <view class="demo-item flex-1">flex-1</view>
          <view class="demo-item flex-2">flex-2</view>
        </view>

        <view class="demo-box flex mb-sm">
          <view class="demo-item flex-none" style="width: 100rpx">flex-none</view>
          <view class="demo-item flex-auto">flex-auto</view>
          <view class="demo-item flex-none" style="width: 100rpx">flex-none</view>
        </view>

        <view class="demo-box flex mb-sm">
          <view class="demo-item flex-shrink-0" style="width: 200rpx">flex-shrink-0</view>
          <view class="demo-item">默认会收缩</view>
        </view>
      </view>

      <!-- 显示/隐藏工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">显示/隐藏工具类</view>

        <view class="demo-label">显示方式</view>
        <view class="demo-box block">block</view>
        <view>
          <view class="demo-box inline">inline</view>
          <view class="demo-box inline">inline</view>
        </view>
        <view>
          <view class="demo-box inline-block">inline-block</view>
          <view class="demo-box inline-block">inline-block</view>
        </view>

        <view class="demo-label">可见性</view>
        <view class="demo-box">visible (默认)</view>
        <view class="demo-box invisible">invisible (不可见但占位)</view>
        <view class="demo-box hidden">hidden (不会显示)</view>
      </view>

      <!-- 位置工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">位置工具类</view>

        <view class="demo-label">定位方式</view>
        <view class="demo-box position-container">
          <view class="demo-item relative">
            relative
            <view class="demo-item absolute" style="top: 10rpx; right: 10rpx">absolute</view>
          </view>
        </view>

        <view class="demo-box sticky" style="top: 0; z-index: 10">sticky (滚动时会固定)</view>
      </view>

      <!-- 边框和圆角工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">边框和圆角工具类</view>

        <view class="demo-label">边框</view>
        <view class="demo-row">
          <view class="demo-box-plain border">border</view>
          <view class="demo-box-plain border-t">border-t</view>
          <view class="demo-box-plain border-r">border-r</view>
          <view class="demo-box-plain border-b">border-b</view>
          <view class="demo-box-plain border-l">border-l</view>
          <view class="demo-box-plain border-0">border-0</view>
        </view>

        <view class="demo-label">圆角</view>
        <view class="demo-row">
          <view class="demo-box-plain border rounded-none">rounded-none</view>
          <view class="demo-box-plain border rounded-sm">rounded-sm</view>
          <view class="demo-box-plain border rounded">rounded</view>
          <view class="demo-box-plain border rounded-lg">rounded-lg</view>
          <view class="demo-box-plain border rounded-full">rounded-full</view>
        </view>
      </view>

      <!-- 背景颜色工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">背景颜色工具类</view>

        <view class="demo-row">
          <view class="demo-box-plain bg-primary text-white">bg-primary</view>
          <view class="demo-box-plain bg-success text-white">bg-success</view>
          <view class="demo-box-plain bg-warning text-white">bg-warning</view>
          <view class="demo-box-plain bg-error text-white">bg-error</view>
        </view>

        <view class="demo-row">
          <view class="demo-box-plain bg-white">bg-white</view>
          <view class="demo-box-plain bg-grey">bg-grey</view>
          <view class="demo-box-plain bg-hover">bg-hover</view>
          <view class="demo-box-plain bg-transparent border">bg-transparent</view>
        </view>
      </view>

      <!-- 宽高和溢出工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">宽高和溢出工具类</view>

        <view class="demo-label">宽度和高度</view>
        <view class="demo-box w-full">w-full</view>
        <view class="demo-box w-auto" style="display: inline-block">w-auto</view>

        <view class="demo-box" style="height: 150rpx">
          <view class="demo-item h-full bg-primary text-white">h-full</view>
        </view>

        <view class="demo-label">溢出处理</view>
        <view class="demo-box overflow-hidden" style="height: 80rpx">
          overflow-hidden<br />这是溢出的内容<br />这是溢出的内容
        </view>

        <view class="demo-box overflow-auto" style="height: 80rpx"> overflow-auto<br />这是溢出的内容<br />这是溢出的内容 </view>

        <view class="demo-box overflow-scroll" style="height: 80rpx">
          overflow-scroll<br />这是溢出的内容<br />这是溢出的内容
        </view>
      </view>

      <!-- 透明度和阴影工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">透明度和阴影工具类</view>

        <view class="demo-label">透明度</view>
        <view class="demo-row">
          <view class="demo-box-plain bg-primary text-white opacity-100">opacity-100</view>
          <view class="demo-box-plain bg-primary text-white opacity-75">opacity-75</view>
          <view class="demo-box-plain bg-primary text-white opacity-50">opacity-50</view>
          <view class="demo-box-plain bg-primary text-white opacity-25">opacity-25</view>
          <view class="demo-box-plain bg-primary text-white opacity-0">opacity-0</view>
        </view>

        <view class="demo-label">阴影</view>
        <view class="demo-row">
          <view class="demo-box-plain shadow">shadow</view>
          <view class="demo-box-plain shadow-heavy">shadow-heavy</view>
          <view class="demo-box-plain shadow-none border">shadow-none</view>
        </view>
      </view>

      <!-- 层级工具类 -->
      <view class="section mb-lg">
        <view class="section-subtitle border-b pb-xs">层级工具类</view>

        <view class="demo-label">z-index</view>
        <view class="demo-box position-container" style="height: 200rpx">
          <view class="demo-item absolute z-0" style=" top: 20rpx;left: 20rpx">z-0</view>
          <view class="demo-item absolute z-10" style=" top: 40rpx;left: 40rpx">z-10</view>
          <view class="demo-item absolute z-20" style=" top: 60rpx;left: 60rpx">z-20</view>
          <view class="demo-item absolute z-30" style=" top: 80rpx;left: 80rpx">z-30</view>
        </view>
      </view>

      <!-- 动漫列表 -->
      <view v-if="typeList.length > 0" class="anime-list">
        <view class="section-subtitle border-b pb-xs">动漫列表</view>
        <view class="row">
          <view v-for="item in typeList" :key="item.mal_id" class="col-6">
            <!-- <anime-card :anime="item"></anime-card> -->
          </view>
        </view>
      </view>
      <view v-else class="flex justify-center items-center" style="height: 200rpx">
        <view class="text-grey">加载中...</view>
      </view>
    </view>
  </view>
  <custom-tabbar current-path="pages/index/index"></custom-tabbar>
</template>

<script setup>
// import { getTypeList } from "@/api";
import { ref } from "vue";

const typeList = ref([]);

// 获取动漫列表数据
// getTypeList()
//   .then((res) => {
//     typeList.value = res;
//   })
//   .catch((err) => {
//     console.error("获取动漫列表失败:", err);
//   });
</script>

<style lang="scss" scoped>
// 页面样式
.page {
  min-height: 100vh;
  padding-bottom: 100rpx; // 为底部导航栏留出空间
}

// 标题样式
.section-title {
  padding-bottom: 12rpx;
  margin: 30rpx 0;
  font-size: 36rpx;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.section-subtitle {
  margin: 30rpx 0 20rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.demo-label {
  margin: 20rpx 0 10rpx;
  font-size: 26rpx;
  color: #666;
}

// 演示区域样式
.section {
  margin-bottom: 40rpx;
}

// 演示盒子
.demo-box {
  padding: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #0277bd;
  text-align: center;
  background-color: #e1f5fe;
  border-radius: 8rpx;
}

.demo-box-outline {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #0277bd;
  text-align: center;
  background-color: #e1f5fe;
  border: 1px dashed #0277bd;
  border-radius: 8rpx;
}

.demo-box-plain {
  padding: 20rpx;
  margin: 10rpx;
  font-size: 28rpx;
  text-align: center;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.demo-item {
  padding: 10rpx;
  margin: 5rpx;
  font-size: 24rpx;
  color: #0277bd;
  background-color: rgb(1 119 189 / 10%);
  border-radius: 4rpx;
}

.position-container {
  position: relative;
  height: 100rpx;
  background-color: #f5f5f5;
}

// 自定义辅助类
.flex-2 {
  flex: 2;
}

// 动漫列表
.anime-list {
  margin-top: 40rpx;
}
</style>
