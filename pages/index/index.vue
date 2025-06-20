<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <button class="location-btn" @click="getLocation">获取位置</button>
    <view class="location-info">{{ locationText }}</view>
    <view class="map-container">
      <map
        id="myMap"
        :latitude="latitude"
        :longitude="longitude"
        :scale="mapScale"
        show-location
        style="width: 100%; height: 300px"
      ></map>
    </view>
  </view>
</template>

<script>
import { getAccurateUserLocationExt } from "@/utils/permissionManager.js";

export default {
  data() {
    return {
      title: "Hello",
      latitude: 0,
      longitude: 0,
      locationText: "",
      mapScale: 16,
      mapContext: null, // 地图上下文对象
    };
  },
  onReady() {
    // 创建地图上下文
    this.mapContext = uni.createMapContext("myMap", this);
  },
  methods: {
    async getLocation() {
      try {
        this.locationText = "正在获取位置...";
        const location = await getAccurateUserLocationExt();
        this.latitude = location.latitude;
        this.longitude = location.longitude;

        // 使用$nextTick确保DOM更新后再执行地图操作
        this.$nextTick(() => {
          this.mapContext.moveToLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          // 在nextTick中恢复scale初始值
          this.mapScale = 16;
        });

        this.locationText = `当前位置：${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        uni.showToast({
          title: "获取位置成功",
          icon: "success",
        });
      } catch (error) {
        this.locationText = `获取位置失败：${error.message}`;
        uni.showToast({
          title: `错误：${error.message}`,
          icon: "none",
          duration: 3000,
        });
      }
    },
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.location-btn {
  width: 80%;
  height: 80rpx;
  background-color: #007aff;
  color: white;
  border-radius: 10rpx;
  margin: 20rpx 0;
}

.location-info {
  margin: 20rpx 0;
  color: #333;
  font-size: 28rpx;
  text-align: center;
}

.map-container {
  width: 100%;
  margin-top: 20rpx;
}
</style>
