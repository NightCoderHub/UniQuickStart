import { requestAndroidPermission } from "./requestAndroidPermission.js";
import { requestWxPermission } from "./requestWxPermission.js";
/**
 * 整合后的获取地理位置权限并获取经纬度函数，使用条件编译区分平台。
 * 内部处理权限请求，并以 Promise 方式返回经纬度信息。
 *
 * @returns {Promise<{latitude: number, longitude: number}>} 返回 Promise，
 * 成功时解析为包含经度和纬度的对象，失败时拒绝（reject）并携带错误信息。
 */
export async function getLocationAndPermission() {
  try {
    let hasPermission = false;

    // #ifdef APP-ANDROID
    const androidPermissionName = "android.permission.ACCESS_FINE_LOCATION";
    const androidPermissionDesc =
      "为了提供精准的定位服务和附近功能，应用需要您的地理位置权限。";
    hasPermission = await requestAndroidPermission(
      androidPermissionName,
      androidPermissionDesc,
    );
    // #endif

    // #ifdef MP-WEIXIN
    const wxScope = "scope.userLocation";
    const wxAuthDesc =
      "为了提供基于您位置的服务（如附近门店、导航），应用需要获取您的地理位置权限。";
    hasPermission = await requestWxPermission(wxScope, wxAuthDesc);
    // #endif

    if (hasPermission) {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: "gcj02", // wgs84 返回 GPS 坐标，gcj02 返回国测局坐标
          success: function (res) {
            console.log("获取地理位置成功：", res.latitude, res.longitude);
            resolve({ latitude: res.latitude, longitude: res.longitude });
          },
          fail: function (err) {
            console.error("获取地理位置失败：", err);
            let errorMessage = "获取地理位置失败";

            if (err.errMsg) {
              if (
                err.errMsg.includes("fail auth deny") ||
                err.errMsg.includes("fail user deny") ||
                err.errMsg.includes("fail api scope deny") ||
                err.errMsg.includes("ERROR_AUTH_DENIED")
              ) {
                errorMessage = "用户拒绝了定位请求";
              } else if (
                err.errMsg.includes("fail:system permission denied") ||
                err.errMsg.includes("fail gps closed")
              ) {
                errorMessage = "手机定位服务未开启或已禁用";
              } else if (err.errMsg.includes("fail no network")) {
                errorMessage = "网络不佳，无法获取位置";
              } else if (err.errMsg.includes("fail timeout")) {
                errorMessage = "获取位置超时，请稍后重试";
              }
            }
            reject(errorMessage); // 拒绝 Promise 并传递错误信息
          },
        });
      });
    } else {
      console.log("用户未授权地理位置权限。");
      return Promise.reject("您已拒绝地理位置权限，部分功能将受限");
    }
  } catch (error) {
    console.error("请求或获取地理位置过程中发生错误:", error);
    return Promise.reject("请求或获取地理位置过程中发生错误"); // 捕获并传递所有其他错误
  }
}
