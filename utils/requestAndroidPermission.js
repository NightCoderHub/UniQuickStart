/**
 * 请求 Android 权限函数 (基于 plus.android.requestPermissions & uni.openAppAuthorizeSetting)
 * @param {string|string[]} permissionName 单个或多个权限字符串，例如 'android.permission.CAMERA', 'android.permission.WRITE_EXTERNAL_STORAGE'
 * 注意：权限字符串必须是 Android 官方定义的完整权限名，且已在 manifest.json 中声明。
 * @param {string} permissionDesc 权限说明，用于展示给用户的文案 (应用内部弹窗)
 * @returns {Promise<boolean>} 返回 Promise，表示所有请求的权限是否最终被授权
 */
export function requestAndroidPermission(permissionName, permissionDesc) {
  const permissions = Array.isArray(permissionName)
    ? permissionName
    : [permissionName];
  const storageKey = `permission_desc_shown_${permissions.sort().join("_")}`; // 使用权限名组合作为key

  return new Promise((resolve) => {
    // 检查是否在 App 环境运行
    if (typeof plus === "undefined" || !plus.android) {
      console.warn(
        "当前环境不支持 plus.android 模块，权限请求功能受限。请在 App 环境运行。",
      );
      resolve(false);
      return;
    }

    // --- 改进点：检查本地存储，看是否已展示过说明弹窗并用户同意 ---
    const hasShownDescAndUserAgreed = uni.getStorageSync(storageKey);
    if (hasShownDescAndUserAgreed) {
      console.log(`检测到已展示过权限说明并用户同意，跳过应用内弹窗。`);
      // 直接执行内部权限请求逻辑
      return requestPermissionInternal(permissions, resolve, storageKey); // 传递 storageKey
    }
    // --- 改进点结束 ---

    // D: 展示权限说明弹窗 (仅当无法预判或预判未授权时才展示)
    uni.showModal({
      title: "权限申请",
      content: permissionDesc,
      confirmText: "同意",
      cancelText: "取消",
      success(modalRes) {
        if (modalRes.confirm) {
          // 用户同意，记录状态
          uni.setStorageSync(storageKey, true);
          // 执行内部权限请求逻辑
          requestPermissionInternal(permissions, resolve, storageKey); // 传递 storageKey
        } else {
          // 用户取消应用内弹窗
          console.log(`用户取消了权限申请。`);
          resolve(false);
        }
      },
    });
  });
}

// 提取公共的权限请求逻辑 (略有修改，增加 storageKey 参数)
function requestPermissionInternal(permissions, resolve, storageKey) {
  plus.android.requestPermissions(
    permissions,
    (requestRes) => {
      const { granted, deniedPresent, deniedAlways } = requestRes;
      const allRequestedGranted = permissions.every((p) => granted.includes(p));

      if (allRequestedGranted) {
        console.log(`所有请求的权限 ${permissions.join(", ")} 已最终授权。`);
        resolve(true);
      } else if (deniedAlways && deniedAlways.length > 0) {
        console.log(`部分权限被永久拒绝: ${deniedAlways.join(", ")}`);
        // 如果有权限被永久拒绝，清理记录，以便下次仍可提示
        uni.removeStorageSync(storageKey);
        uni.showModal({
          title: "权限受限",
          content: `您已永久拒绝授权${deniedAlways.join("、")}等权限，这将影响部分功能使用。请前往设置页面开启权限。`,
          confirmText: "去设置",
          cancelText: "暂不需要",
          success(guideModalRes) {
            if (guideModalRes.confirm) {
              uni.openAppAuthorizeSetting({
                success() {
                  console.log("已跳转到应用授权设置页。");
                  resolve(false);
                },
                fail(err) {
                  console.error("跳转应用授权设置页失败:", err);
                  uni.showToast({
                    title:
                      "无法自动跳转，请手动前往系统设置->应用管理->本应用->权限，进行设置",
                    icon: "none",
                    duration: 4000,
                  });
                  resolve(false);
                },
              });
            } else {
              console.log(`用户选择暂不需要开启权限。`);
              resolve(false);
            }
          },
        });
      } else {
        console.log(
          `部分权限被临时拒绝: ${deniedPresent ? deniedPresent.join(", ") : "无"}`,
        );
        console.log(`用户拒绝了权限请求，但未选择永久拒绝。`);
        // 如果是临时拒绝，也可以考虑清理记录，以便下次仍可提示
        // uni.removeStorageSync(storageKey); // 看产品需求决定是否清理
        resolve(false);
      }
    },
    (requestError) => {
      console.error(
        "请求 Android 权限失败 (API参数错误或内部错误):",
        requestError,
      );
      // 发生错误，清理记录
      uni.removeStorageSync(storageKey);
      resolve(false);
    },
  );
}
