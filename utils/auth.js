// utils/auth.js

/**
 * 通用的 UniApp 授权请求方法
 * 结合了首次授权请求、已授权判断、曾拒绝引导、App 端处理等逻辑
 * @param {string} scope 授权范围，例如 'scope.userInfo', 'scope.userLocation', 'scope.writePhotosAlbum'
 * @param {string} name 权限的友好名称，用于向用户解释为什么需要此权限 (例如：'获取您的地理位置')
 * @returns {Promise<boolean>} 返回一个 Promise，表示授权是否成功
 */
export function requestAuth(scope, name = '') {
  return new Promise(async (resolve, reject) => {
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
    // 小程序平台通用逻辑
    try {
      const setting = await uni.getSetting();
      const authStatus = setting.authSetting[scope];

      if (authStatus === true) {
        // 1. 已经授权
        resolve(true);
      } else if (authStatus === false) {
        // 2. 曾经拒绝授权，引导用户进入设置页面
        uni.showModal({
          title: '授权提示',
          content: `亲爱的用户，为了能让您使用该服务，请您前往小程序右上角的设置项，把${name ? name : '相关'}权限开启后再试试哦。`,
          confirmText: '去设置',
          confirmColor: '#465CFF', // 您的自定义颜色
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting[scope]) {
                    resolve(true); // 用户在设置页开启了权限
                  } else {
                    console.warn(`[${name || scope}]用户未在设置页打开权限`);
                    reject(new Error('用户未在设置页打开权限')); // 用户在设置页仍然拒绝或未开启
                  }
                },
                fail: (err) => {
                  console.error(`[${name || scope}]打开设置页失败`, err);
                  reject(new Error('打开设置页失败'));
                }
              });
            } else {
              console.warn(`[${name || scope}]用户取消进入设置页`);
              reject(new Error('用户取消进入设置页')); // 用户取消进入设置页
            }
          },
          fail: (err) => {
            console.error(`[${name || scope}]显示授权提示模态框失败`, err);
            reject(new Error('显示授权提示模态框失败'));
          }
        });
      } else {
        // 3. 首次授权或未曾请求授权，直接请求授权
        uni.authorize({
          scope: scope,
          success: () => {
            resolve(true); // 授权成功
          },
          fail: (err) => {
            console.warn(`[${name || scope}]授权失败，用户可能拒绝`, err);
            reject(new Error('用户拒绝授权或授权失败')); // 授权失败 (用户点击了拒绝)
          }
        });
      }
    } catch (error) {
      console.error(`[${name || scope}]获取授权状态失败`, error);
      reject(new Error('获取授权状态失败')); // 获取状态失败，视为未授权
    }
    // #endif

    // #ifdef APP-PLUS
    // App 端逻辑
    // App 端权限机制与小程序不同，通常在 manifest.json 配置后，首次使用会由系统弹窗请求。
    // 这里主要处理用户在系统设置中关闭权限后的引导。
    try {
      // uni.getAppAuthorizeSetting() 返回的权限字段可能与 scope 不同，需要映射
      // 这是一个映射示例，实际使用时请根据 UniApp 官方文档确认准确的 App 端权限字段名
      const appAuthMap = {
        'scope.userLocation': 'locationAuthorized',
        'scope.camera': 'cameraAuthorized',
        'scope.writePhotosAlbum': 'albumAuthorized',
        'scope.record': 'microphoneAuthorized',
        // ...更多映射
      };

      const appPermissionKey = appAuthMap[scope];
      if (!appPermissionKey) {
        console.warn(`[${scope}]App 端未找到对应的权限映射，直接视为成功。`);
        return resolve(true); // 如果没有明确映射，假设已授权或由系统处理
      }

      const settingRes = await uni.getAppAuthorizeSetting();
      const appAuthStatus = settingRes[appPermissionKey];

      if (appAuthStatus === 'authorized') {
        resolve(true); // App 权限已授权
      } else if (appAuthStatus === 'denied' || appAuthStatus === 'restricted') {
        // App 权限被拒绝或受限，引导用户到系统设置
        uni.showModal({
          title: '授权提示',
          content: `亲爱的用户，为了能让您使用该服务，请您前往设备的系统设置中，把${name ? name : '相关'}权限开启后再试试哦。`,
          confirmText: '去设置',
          confirmColor: '#465CFF',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.openAppAuthorizeSetting({
                success: () => {
                  // 用户去设置了，回来后可以再次调用此方法进行检查，或者直接 resolve
                  // 这里选择 resolve(true)，但实际业务可能需要用户重试操作
                  resolve(true);
                },
                fail: (err) => {
                  console.error(`[${name || scope}]打开App系统设置失败`, err);
                  reject(new Error('打开App系统设置失败'));
                }
              });
            } else {
              console.warn(`[${name || scope}]用户取消打开App系统设置`);
              reject(new Error('用户取消打开App系统设置'));
            }
          }
        });
      } else {
        // 未授权状态，或者其他情况，允许调用，通常首次调用会触发系统权限弹窗
        resolve(true);
      }
    } catch (error) {
      console.error(`[${name || scope}]获取App授权设置失败`, error);
      reject(new Error('获取App授权设置失败'));
    }
    // #endif

    // #ifdef H5
    // H5 端权限处理非常依赖浏览器和 HTTPS 环境，并且没有统一的授权API
    // 大部分浏览器权限（如地理位置、摄像头）会在首次请求时由浏览器弹出确认框
    // 无法像小程序或App那样主动打开设置页
    console.warn(`[${name || scope}]H5 端权限处理受浏览器限制，可能无法主动请求或引导用户。`);
    // 对于H5，可以根据具体API判断是否支持和获取权限，这里直接resolve，
    // 具体API调用时会触发浏览器权限弹窗或报错。
    resolve(true);
    // #endif
  });
}