// stores/modules/device.js
import { defineStore } from "pinia";
import { getLocationAndPermission, reverseGeocode } from "@/utils/locationService.js";

export const useDeviceStore = defineStore("device", {
  state: () => ({
    // 系统设置信息
    systemSetting: null,
    // 设备基础信息
    deviceInfo: null,
    // 窗口信息
    windowInfo: null,
    // 应用基础信息
    appBaseInfo: null,
    // 应用授权设置
    appAuthorizeSetting: null,
    // 网络状态
    networkStatus: "unknown",
    // 位置信息
    location: null,
    // 县级区域
    district: "定位中...",
    // 权限信息
    permissions: {},
  }),

  getters: {
    // 兼容旧版本的systemInfo getter
    systemInfo: (state) => {
      if (!state.deviceInfo || !state.windowInfo || !state.appBaseInfo) {
        return null;
      }
      // 合并各个API的信息，保持向后兼容
      return {
        ...state.deviceInfo,
        ...state.windowInfo,
        ...state.appBaseInfo,
        ...state.systemSetting,
      };
    },
  },

  actions: {
    async initSystemInfo() {
      try {
        // 获取系统设置
        // #ifdef APP-PLUS || MP-WEIXIN
        this.systemSetting = uni.getSystemSetting();
        // #endif

        // 获取设备基础信息
        this.deviceInfo = uni.getDeviceInfo();

        // 获取窗口信息
        this.windowInfo = uni.getWindowInfo();

        // 获取应用基础信息
        this.appBaseInfo = uni.getAppBaseInfo();

        // 获取应用授权设置
        // #ifdef APP-PLUS
        this.appAuthorizeSetting = uni.getAppAuthorizeSetting();
        // #endif

        console.log("系统信息初始化完成");
      } catch (error) {
        console.error("获取系统信息失败:", error);
        // 降级处理：如果新API不可用，尝试使用旧API
        try {
          this.systemInfo = uni.getSystemInfoSync();
          console.warn("使用了已废弃的uni.getSystemInfoSync()作为降级方案");
        } catch (fallbackError) {
          console.error("降级方案也失败:", fallbackError);
        }
      }
    },

    setNetworkStatus(status) {
      this.networkStatus = status.networkType;
    },

    async updateLocation() {
      try {
        // 使用统一的位置获取函数，包含权限处理
        const locationData = await getLocationAndPermission();

        // 进行逆地址解析
        try {
          const geocodeResult = await reverseGeocode(locationData.latitude, locationData.longitude);
          // 将经纬度和逆地址解析结果合并存储
          this.location = {
            ...locationData,
            geocode: geocodeResult,
          };
          // 提取县级区域
          this.district = geocodeResult?.address_component?.district || "定位失败";
          console.log("位置信息和逆地址解析更新成功:", this.location);
        } catch (geocodeError) {
          console.warn("逆地址解析失败，仅保存经纬度信息:", geocodeError);
          // 即使逆地址解析失败，也保存经纬度信息
          this.location = locationData;
          // 提取县级区域
          this.district = "定位失败";
        }
      } catch (error) {
        console.error("获取位置失败:", error);
        // 清空位置信息
        this.location = null;
        // 清空县级区域
        this.district = "定位失败";
      }
    },
  },
});
