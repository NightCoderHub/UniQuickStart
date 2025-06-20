/* eslint-disable no-unreachable */
// utils/permissionManager.js

// --- APP-PLUS 平台的条件导入 ---
// 这些导入只会在编译到 App 平台时包含。
// #ifdef APP-PLUS
import {
  isIos,
  judgeIosPermissionCamera,
  judgeIosPermissionContact,
  judgeIosPermissionLocation,
  judgeIosPermissionPhotoLibrary,
  judgeIosPermissionPush,
  judgeIosPermissionRecord,
  judgeIosPermissionCalendar,
  judgeIosPermissionMemo,
  requestAndroidPermission, // 处理发起 Android 权限请求 (Promise 函数)
  checkSystemEnableLocation, // 检查系统 GPS 状态
  permissionMap, // 假设 permissionMap 正确导出并包含 Android 权限字符串。
} from "@/js_sdk/permission.js"; // 根据你的项目结构调整导入路径

// 简化的 Android 权限说明对话框。
// 在生产环境中，如果需要复杂的原生 View 弹窗，请根据你的 `js_sdk/permission.js` 中的 `showViewDesc` 逻辑进行调整。
// 本示例使用 `uni.showModal` 进行演示。
const showAndroidPermissionRationale = (permissionKey, permissionName) => {
  let content = `为提供${permissionName}功能，我们需要相关权限。`;
  const androidPermissionConfig =
    {
      CAMERA: "用于拍照或录像",
      EXTERNAL_STORAGE: "用于读写相册或文件",
      ACCESS_FINE_LOCATION: "用于获取精确地理位置信息",
      RECORD_AUDIO: "用于录音或语音输入",
      // ... 其他 Android 权限描述
    }[permissionKey] || "";

  if (androidPermissionConfig) {
    content = `为提供${permissionName}功能，${androidPermissionConfig}。请授予权限。`;
  }

  return new Promise((resolve) => {
    uni.showModal({
      title: "权限说明",
      content: content,
      confirmText: "知道了",
      showCancel: false,
      success: () => resolve(true),
    });
  });
};
// #endif

// --- 统一权限映射表 ---
// 将统一的 'scope.xxx' 标识符映射到平台特定的权限键或判断函数。
const PERMISSION_MAP = {
  "scope.userInfo": {
    // 小程序特定
    mp: "scope.userInfo",
    name: "用户信息",
  },
  "scope.userLocation": {
    mp: "scope.userLocation",
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionLocation, // 对应 js_sdk/permission.js 中的函数
    androidKey: "ACCESS_FINE_LOCATION", // 对应 Android 权限字符串 (在 Android 请求时使用)
    // #endif
    name: "地理位置",
  },
  "scope.camera": {
    mp: "scope.camera",
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionCamera,
    androidKey: "CAMERA",
    // #endif
    name: "相机",
  },
  "scope.writePhotosAlbum": {
    mp: "scope.writePhotosAlbum",
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionPhotoLibrary,
    androidKey: "WRITE_EXTERNAL_STORAGE", // 通常需要写入权限才能保存图片，对应 Android Manifest 权限
    // #endif
    name: "相册",
  },
  "scope.record": {
    mp: "scope.record",
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionRecord,
    androidKey: "RECORD_AUDIO",
    // #endif
    name: "麦克风",
  },
  "scope.push": {
    // App 平台特定
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionPush,
    androidKey: "POST_NOTIFICATIONS", // Android 13+ 推送权限，之前无需运行时权限
    // #endif
    name: "消息推送",
  },
  "scope.contacts": {
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionContact,
    androidKey: "READ_CONTACTS", // Android 联系人读取权限
    // #endif
    name: "通讯录",
  },
  "scope.calendar": {
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionCalendar,
    androidKey: "READ_CALENDAR", // Android 日历读取权限
    // #endif
    name: "日历",
  },
  "scope.memo": {
    // #ifdef APP-PLUS
    iosFunc: judgeIosPermissionMemo,
    // Android 目前没有直接的备忘录系统权限，或者可能需要特定的 SDK。
    // #endif
    name: "备忘录",
  },
};

/**
 * 统一的权限检查和请求方法。
 * 根据当前运行平台（小程序、App-iOS、App-Android、H5）智能选择权限处理逻辑。
 * 成功时解析为 `true`，失败时拒绝并带有 `Error` 对象。
 *
 * @param {string} scope - 统一权限标识符，例如 'scope.userLocation', 'scope.camera'。
 * @param {string} [name='所需功能'] - 权限的友好名称，用于用户提示。
 * @returns {Promise<boolean>} Promise 结果: 成功返回 `true`，失败返回 `Error` 对象。
 */
export async function checkAndRequestPermission(scope, name = "所需功能") {
  const permissionConfig = PERMISSION_MAP[scope];

  if (!permissionConfig) {
    console.warn(`[PermissionManager] 未知的权限范围: ${scope}`);
    throw new Error(`未知的权限类型: ${scope}`);
  }

  const permissionName = permissionConfig.name || name;

  // --- 小程序平台逻辑 ---
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
  const mpScope = permissionConfig.mp;
  if (!mpScope) {
    console.warn(`[PermissionManager] 小程序平台不支持 ${scope} 权限`);
    throw new Error(`小程序平台不支持此权限: ${scope}`);
  }

  try {
    const setting = await uni.getSetting();
    const authStatus = setting.authSetting[mpScope];

    if (authStatus === true) {
      // 已经授权
      return true;
    } else if (authStatus === false) {
      // 之前拒绝授权，引导用户进入设置页面
      const modalRes = await uni.showModal({
        title: "授权提示",
        content: `亲爱的用户，为了使用${permissionName}功能，请到小程序右上角设置中开启${permissionName}。`,
        confirmText: "去设置",
        confirmColor: "#465CFF",
        cancelText: "取消",
      });

      if (modalRes.confirm) {
        const settingRes = await uni.openSetting();
        if (settingRes.authSetting[mpScope]) {
          return true; // 用户在设置页面中开启了权限
        } else {
          console.warn(`[${permissionName}] 用户未在设置页面中开启权限`);
          throw new Error("用户未在设置页面中开启权限");
        }
      } else {
        console.warn(`[${permissionName}] 用户取消进入设置页面`);
        throw new Error("用户取消进入设置页面");
      }
    } else {
      // 首次授权或从未请求过授权，直接请求授权
      try {
        await uni.authorize({ scope: mpScope });
        return true; // 授权成功
      } catch (err) {
        console.warn(`[${permissionName}] 小程序授权失败，用户可能已拒绝`, err);
        throw new Error("用户拒绝授权或授权失败"); // 授权失败 (用户点击拒绝)
      }
    }
  } catch (error) {
    console.error(`[${permissionName}] 获取小程序授权状态或请求失败`, error);
    throw new Error(`获取小程序授权状态或请求失败: ${error.message}`);
  }
  // #endif

  // --- APP 平台逻辑 ---
  // #ifdef APP-PLUS
  if (isIos) {
    const iosFunc = permissionConfig.iosFunc;
    if (!iosFunc || typeof iosFunc !== "function") {
      console.warn(
        `[PermissionManager] iOS 平台未配置 ${scope} 权限的有效判断函数`,
      );
      throw new Error(`iOS 平台不支持 ${scope} 权限检查或未配置`);
    }

    const hasPermission = iosFunc(); // 调用 js_sdk/permission.js 中的 iOS 原生判断函数
    if (hasPermission) {
      return true;
    } else {
      // 权限未开启，引导用户进入系统设置
      const modalRes = await uni.showModal({
        title: "授权提示",
        content: `亲爱的用户，为了使用${permissionName}功能，请到设备系统设置中开启${permissionName}权限。`,
        confirmText: "去设置",
        confirmColor: "#465CFF",
        cancelText: "取消",
      });

      if (modalRes.confirm) {
        try {
          await uni.openAppAuthorizeSetting();
          // 假设用户进入设置后会开启。
          // 如果需要严格验证，可以在 openAppAuthorizeSetting 回调后再次调用 iosFunc()。
          return true;
        } catch (err) {
          console.error(`[${permissionName}] 打开 App 系统设置失败`, err);
          throw new Error("打开 App 系统设置失败");
        }
      } else {
        console.warn(`[${permissionName}] 用户取消打开 App 系统设置`);
        throw new Error("用户取消打开 App 系统设置");
      }
    }
  } else {
    // Android 权限判断和请求
    const androidKey = permissionConfig.androidKey;
    if (!androidKey) {
      console.warn(`[PermissionManager] Android 平台未配置 ${scope} 权限键`);
      throw new Error(`Android 平台不支持 ${scope} 权限检查或未配置`);
    }

    // 从你的 permissionMap 中获取 Android 权限字符串
    const androidPermissionStrings = permissionMap.android[androidKey]?.name;
    if (!androidPermissionStrings) {
      console.warn(
        `[PermissionManager] Android 权限映射表中不包含 ${androidKey} 的特定权限字符串`,
      );
      throw new Error(`Android 权限映射配置错误: ${androidKey}`);
    }

    // 检查当前权限状态 (不会触发系统对话框)
    let isFullyGranted = true;
    const permissionArray = androidPermissionStrings.split(",");
    for (const perm of permissionArray) {
      const status = plus.navigator.checkPermission(perm);
      if (status === "denied" || status === "undetermined") {
        isFullyGranted = false;
        break;
      }
    }

    if (isFullyGranted) {
      return true; // 完全授权
    } else {
      // 未完全授权，首先显示权限解释对话框 (可以基于你的 js_sdk/permission.js 中的 showViewDesc)
      // 这里使用简化的 `uni.showModal` 而不是你的 `plus.nativeObj.View` 对话框。
      // **重要提示:** 如果你想使用 `plus.nativeObj.View` 原生对话框，
      // 你需要确保 `showViewDesc` 可以在 `js_sdk/permission.js` 中被调用
      // 并处理其生命周期 (例如 `view.close()`)。
      // 考虑到 `plus.nativeObj.View` 的复杂性，此处模拟 `uni.showModal`。
      await showAndroidPermissionRationale(androidKey, permissionName); // 简化提示

      // 然后发起 Android 权限请求
      const requestResult = await requestAndroidPermission(
        androidPermissionStrings,
      ); // 调用 js_sdk/permission.js 中的函数

      // 如果有需要关闭的原生视图，在这里处理。
      // 例如：if (view && view.close) view.close(); // 这取决于你的 js_sdk/permission.js 内部实现

      if (requestResult === 1) {
        return true; // 授权成功
      } else if (requestResult === -1) {
        // 永久拒绝，引导用户进入应用设置
        const modalRes = await uni.showModal({
          title: "提示",
          content: `操作权限已被拒绝。请手动前往设置页开启${permissionName}权限。`,
          confirmText: "现在去设置",
        });

        if (modalRes.confirm) {
          try {
            await uni.openAppAuthorizeSetting();
            return true; // 用户进入设置，假设他们会开启
          } catch (err) {
            throw new Error("打开 App 设置失败", err);
          }
        } else {
          throw new Error("用户取消进入设置");
        }
      } else {
        // 本次拒绝或请求失败
        console.warn(
          `[${permissionName}] Android 权限请求失败或被拒绝，结果: ${requestResult}`,
        );
        throw new Error("用户拒绝或权限请求失败");
      }
    }
  }
  // #endif

  // --- H5 平台逻辑 ---
  // #ifdef H5
  console.warn(
    `[PermissionManager] H5 权限处理受浏览器限制，无法主动请求或引导用户。`,
  );
  // H5 权限通常在使用 API 时由浏览器自动提示。这里乐观地返回 true。
  return true;
  // #endif
}

/**
 * 获取用户地理位置信息的综合流程。
 * 包括平台权限授权、设备定位服务检查和详细的错误处理。
 *
 * @returns {Promise<Object>} 成功时解析为位置数据，失败时拒绝并带有 Error 对象。
 */
export function getAccurateUserLocationExt() {
  // 移除executor函数的async关键字
  return new Promise((resolve, reject) => {
    // 使用立即执行的async函数包裹异步逻辑
    (async () => {
      try {
        const authSuccess = await checkAndRequestPermission(
          "scope.userLocation",
          "地理位置",
        );

        if (!authSuccess) {
          reject(new Error("地理位置权限未授权"));
          return;
        }

        // #ifdef APP-PLUS
        const systemLocationEnabled = checkSystemEnableLocation();
        if (!systemLocationEnabled) {
          uni.showModal({
            title: "定位失败",
            content: "手机定位服务未开启。请前往手机系统设置中开启。",
            confirmText: "去开启",
            cancelText: "取消",
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.showToast({
                  title: "请手动开启手机定位服务",
                  icon: "none",
                  duration: 3000,
                });
              }
              reject(new Error("手机系统定位服务未开启"));
            },
          });
          return;
        }
        // #endif

        uni.showLoading({
          title: "正在获取位置...",
          mask: true,
        });

        uni.getLocation({
          type: "gcj02",
          success: (res) => {
            uni.hideLoading();
            resolve(res);
          },
          fail: (err) => {
            uni.hideLoading();
            console.error("[uni.getLocation] 失败:", err);
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
                uni.showModal({
                  title: "定位失败",
                  content:
                    "手机定位服务未开启或已禁用。请前往手机系统设置中开启定位服务。",
                  confirmText: "去开启",
                  cancelText: "取消",
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      uni.showToast({
                        title: "请手动开启手机定位服务",
                        icon: "none",
                        duration: 3000,
                      });
                    }
                    reject(new Error(errorMessage));
                  },
                });
                return;
              } else if (err.errMsg.includes("fail no network")) {
                errorMessage = "网络不佳，无法获取位置";
              } else if (err.errMsg.includes("fail timeout")) {
                errorMessage = "获取位置超时，请稍后重试";
              }
            }
            reject(new Error(errorMessage));
          },
        });
      } catch (error) {
        uni.hideLoading();
        console.error("[getAccurateUserLocationExt] 流程中断:", error);
        reject(error);
      }
    })(); // 立即执行async函数
  });
}
