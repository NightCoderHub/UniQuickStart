/**
 * 统一的微信小程序权限请求函数
 * @param {string} scope 权限作用域，例如 'scope.userLocation', 'scope.camera', 'scope.writePhotosAlbum'
 * @param {string} authDesc 权限请求的描述，用于 showModal 提示用户（当需要引导用户去设置时）
 * @returns {Promise<boolean>} 返回 Promise，表示权限是否获取成功
 */
export function requestWxPermission(scope, authDesc) {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        // 判断当前权限状态
        if (res.authSetting[scope] === true) {
          // 已授权
          resolve(true);
        } else if (res.authSetting[scope] === false) {
          // 已拒绝，且不是首次拒绝（用户点击了“拒绝”且不再提示），需要引导用户去设置页开启
          uni.showModal({
            title: "授权提示",
            content:
              authDesc ||
              `我们需要您的${getPermissionName(scope)}权限才能为您提供服务，请在设置中开启。`,
            confirmText: "去设置",
            cancelText: "取消",
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting[scope]) {
                      resolve(true); // 用户在设置页开启了权限
                    } else {
                      resolve(false); // 用户在设置页未开启权限
                    }
                  },
                  fail: () => {
                    console.error("打开设置页失败");
                    resolve(false);
                  },
                });
              } else {
                resolve(false); // 用户取消了弹窗
              }
            },
            fail: () => {
              console.error("showModal 失败");
              resolve(false);
            },
          });
        } else {
          // 未授权过（首次请求或用户在设置中关闭后再次请求），直接调用 uni.authorize 请求权限
          uni.authorize({
            scope: scope,
            success: () => {
              resolve(true); // 授权成功
            },
            fail: (err) => {
              // 授权失败（用户拒绝）
              // ！！！这里不再直接弹出 showModal 告知用户“授权失败”
              // 理由：用户刚刚在授权弹窗中点击了“拒绝”，再弹一个提示会打断用户，且缺乏引导性。
              // 对于首次拒绝，下次调用 authorize 还会再次弹窗。
              // 对于已拒绝且不再提示的情况（authSetting[scope] === false），已经通过 getSetting 处理了。
              console.warn(
                `用户拒绝了 ${getPermissionName(scope)} 权限：`,
                err,
              );
              resolve(false); // 用户拒绝
            },
          });
        }
      },
      fail: (err) => {
        console.error("获取设置失败：", err);
        resolve(false); // 获取设置失败
      },
    });
  });
}

/**
 * 根据权限 scope 返回对应的中文名称
 * @param {string} scope 权限作用域
 * @returns {string} 权限中文名称
 */
function getPermissionName(scope) {
  switch (scope) {
    case "scope.userLocation":
      return "地理位置";
    case "scope.camera":
      return "相机";
    case "scope.writePhotosAlbum":
      return "保存到相册";
    case "scope.record":
      return "录音";
    case "scope.userInfo":
      return "用户信息";
    default:
      return "所需";
  }
}
