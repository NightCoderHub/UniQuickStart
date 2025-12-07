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

    // #ifdef APP-PLUS
    const androidPermissionName = "android.permission.ACCESS_FINE_LOCATION";
    const androidPermissionDesc = "为了提供精准的定位服务和附近功能，应用需要您的地理位置权限。";
    hasPermission = await requestAndroidPermission(androidPermissionName, androidPermissionDesc);
    // #endif

    // #ifdef MP-WEIXIN
    const wxScope = "scope.userFuzzyLocation";
    const wxAuthDesc = "为了提供基于您位置的服务（如附近门店、导航），应用需要获取您的地理位置权限。";
    hasPermission = await requestWxPermission(wxScope, wxAuthDesc);
    // #endif

    // #ifdef H5
    // H5端地理位置权限通常由浏览器自动处理弹窗,因此这里不需要显式地请求权限，而是直接尝试获取位置,如果用户拒绝，uni.getLocation的fail回调会处理
    hasPermission = true;
    // #endif

    if (hasPermission) {
      return new Promise((resolve, reject) => {
        const handleSuccess = (res) => {
          console.log("获取地理位置成功：", res.latitude, res.longitude);
          resolve({ latitude: res.latitude, longitude: res.longitude });
        };

        const handleFail = (err) => {
          console.error("获取地理位置失败：", err);
          let errorMessage = "获取地理位置失败";
          if (err.errMsg) {
            const errMsgLower = err.errMsg.toLowerCase(); // 统一转小写方便判断
            if (
              errMsgLower.includes("fail auth deny") ||
              errMsgLower.includes("fail user deny") ||
              errMsgLower.includes("fail api scope deny") ||
              errMsgLower.includes("error_auth_denied")
            ) {
              errorMessage = "用户拒绝了定位请求";
            } else if (
              errMsgLower.includes("fail:system permission denied") ||
              errMsgLower.includes("fail gps closed") ||
              // H5端常见未开启GPS或定位功能信息
              errMsgLower.includes("geolocation:position unavailable") ||
              errMsgLower.includes("gps is off")
            ) {
              errorMessage = "手机定位服务未开启或已禁用";
            } else if (errMsgLower.includes("fail no network")) {
              errorMessage = "网络不佳，无法获取位置";
            } else if (errMsgLower.includes("fail timeout")) {
              errorMessage = "获取位置超时，请稍后重试";
            } else if (
              // H5端非HTTPS常见错误
              errMsgLower.includes("only secure origins are allowed") ||
              errMsgLower.includes("not on a secure origin")
            ) {
              errorMessage = "当前页面非HTTPS协议，无法获取地理位置";
            }
          }
          reject(errorMessage); // 拒绝 Promise 并传递错误信息
        };

        // #ifdef MP-WEIXIN
        uni.getFuzzyLocation({
          type: "gcj02",
          success: handleSuccess,
          fail: handleFail,
        });
        // #endif

        // #ifndef MP-WEIXIN
        uni.getLocation({
          type: "gcj02",
          success: handleSuccess,
          fail: handleFail,
        });
        // #endif
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

/**
 * 使用腾讯地图逆地址解析服务获取位置信息。
 *
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @returns {Promise<Object>} 返回一个Promise，
 * 成功时resolve定位结果数据，失败时reject错误信息。
 */
export function reverseGeocode(latitude, longitude) {
  const key = "AD7BZ-55HLM-72N6E-6ZXGL-MKOLS-D3BJN"; // 你的腾讯地图Key
  let baseUrl = "https://apis.map.qq.com/ws/geocoder/v1/";
  // #ifdef H5
  baseUrl = "/tencent_map_api/ws/geocoder/v1/";
  // #endif
  const url = `${baseUrl}?location=${latitude},${longitude}&key=${key}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url: url,
      method: "GET",
      success: (res) => {
        if (res.statusCode === 200 && res.data.status === 0) {
          // status 为 0 表示请求成功
          const locationData = res.data.result;
          resolve(locationData); // 返回包含位置信息的result对象
        } else {
          // 请求失败或返回的status不为0
          console.error("逆地址解析失败:", res.data.message || "未知错误");
          reject(res.data.message || "逆地址解析请求失败");
        }
      },
      fail: (err) => {
        // 网络请求失败
        console.error("逆地址解析网络请求失败:", err);
        reject("网络请求失败，请检查网络连接");
      },
    });
  });
}
