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

/**
 * 统一的微信小程序权限请求函数
 * @param {string} scope 权限作用域，例如 'scope.userLocation', 'scope.camera', 'scope.writePhotosAlbum'
 * @param {string} authDesc 权限请求的描述，用于 showModal 提示用户（当需要引导用户去设置时）
 * @returns {Promise<boolean>} 返回 Promise，表示权限是否获取成功
 */
export async function requestWxPermission(scope, authDesc) {
  try {
    // 获取当前设置
    const settingRes = await uni.getSetting();
    const authStatus = settingRes.authSetting[scope];

    if (authStatus === true) {
      // 已经授权
      return true;
    } else if (authStatus === false) {
      // 权限已被拒绝，且不是首次拒绝（用户点击了“拒绝”且不再提示）。引导用户前往设置页开启。
      const modalRes = await uni.showModal({
        title: "授权提示",
        content:
          authDesc ||
          `我们需要您的${getPermissionName(scope)}权限才能为您提供服务，请在设置中开启。`,
        confirmText: "去设置",
        cancelText: "取消",
      });

      if (modalRes.confirm) {
        try {
          // 用户点击“去设置”，打开设置页
          const openSettingRes = await uni.openSetting();
          // 返回 true 如果用户在设置页开启了权限，否则返回 false
          return openSettingRes.authSetting[scope] === true;
        } catch (openSettingErr) {
          console.error("打开设置页失败：", openSettingErr);
          // 抛出错误，指示打开设置页失败
          throw new Error(
            `Failed to open settings page for ${getPermissionName(scope)}: ${openSettingErr.errMsg || JSON.stringify(openSettingErr)}`,
          );
        }
      } else {
        // 用户取消了弹窗
        return false;
      }
    } else {
      // 尚未授权（首次请求或用户在设置中关闭后再次请求）。直接请求权限。
      try {
        // 请求权限
        await uni.authorize({ scope });
        return true; // 授权成功
      } catch (authorizeErr) {
        // 用户拒绝了授权请求 (这是用户意图，通常不作为错误抛出，而是返回false)
        console.warn(
          `用户拒绝了 ${getPermissionName(scope)} 权限：`,
          authorizeErr,
        );
        return false;
      }
    }
  } catch (getSettingErr) {
    console.error("获取设置失败：", getSettingErr);
    // 抛出错误，指示获取设置失败
    throw new Error(
      `Failed to get settings for ${getPermissionName(scope)}: ${getSettingErr.errMsg || JSON.stringify(getSettingErr)}`,
    );
  }
}
