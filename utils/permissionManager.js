// utils/permissionManager.js

// --- 导入您的 js_sdk/permission.js 中的函数 ---
// 请根据您实际的文件路径调整导入路径 '@/js_sdk/permission.js'
// 确保您在 js_sdk/permission.js 中已将这些函数 'export' 出来。
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
  requestAndroidPermission, // 负责发起 Android 权限请求的 Promise 函数
  checkSystemEnableLocation, // 检查系统 GPS 状态的函数

  // 如果您的 permission.js 中有全局的 permissionMap 和 showViewDesc，
  // 并且它们是为 requestAndroidPermission 的内部逻辑服务的，通常不需要在这里导入。
  // 如果它们需要被外部直接访问，或者 permissionManager.js 需要使用它们来构建提示，则需要导入。
  // 在这里，我将 permissionMap 视为配置，在当前文件定义，showViewDesc 假设是 js_sdk/permission.js 内部调用。
} from '@/js_sdk/permission.js'; // 导入路径需根据您的项目实际情况调整

// 由于 Android 的 showViewDesc 依赖 Native View，其生命周期和全局变量管理复杂。
// 假设您的 showViewDesc 及其依赖（view, statusBarHeight, windowWidth, permissionMap）
// 都在 js_sdk/permission.js 内部被正确管理，且 requestAndroidPermission 调用它。
// 如果 showViewDesc 是单独导出的，请在这里导入并确保其逻辑正确。
// 为了简化，这里不再从 js_sdk 导入 permissionMap 和 showViewDesc。
// Android 的权限描述信息将直接在当前文件配置，或者在调用时动态生成。
// 鉴于您 showViewDesc 的复杂性，此处假设它在 `js_sdk/permission.js` 内部被 `requestAndroidPermission` 调用。
// 或者您需要将其重新定义在此文件，并处理 Native View 生命周期。
// 对于本例，我将简化处理 Android 权限描述弹窗，主要聚焦于权限请求逻辑。
// 如果您坚持使用 `plus.nativeObj.View`，请确保其生命周期和作用域在您的 `js_sdk/permission.js` 中得到良好管理。

// 简化 Android 权限描述弹窗处理，仅作演示
// 实际生产环境，请根据您的 `js_sdk/permission.js` 中的 `showViewDesc` 逻辑进行适配
const showAndroidPermissionRationale = (permissionKey, permissionName) => {
    // 这是一个简化版本，如果您有复杂的原生 View 弹窗，请保持在 js_sdk/permission.js 中实现。
    // 这里仅使用 uni.showModal 进行模拟提示。
    let content = `为了提供${permissionName}功能，我们需要相关权限。`;
    const androidPermissionConfig = {
        'CAMERA': '用于拍照或录像',
        'EXTERNAL_STORAGE': '用于读写相册或文件',
        'ACCESS_FINE_LOCATION': '用于获取精准地理位置信息',
        'RECORD_AUDIO': '用于录音或语音输入',
        // ... 其他 Android 权限描述
    }[permissionKey] || '';

    if (androidPermissionConfig) {
        content = `为了提供${permissionName}功能，${androidPermissionConfig}。请您授权。`;
    }

    return new Promise(resolve => {
        uni.showModal({
            title: '权限说明',
            content: content,
            confirmText: '我知道了',
            showCancel: false,
            success: () => resolve(true)
        });
    });
};

// #endif

// --- 统一的权限映射表 ---
// 将统一的 'scope.xxx' 标识符映射到不同平台对应的权限键或判断函数。
const PERMISSION_MAP = {
  'scope.userInfo': { // 小程序特有
    mp: 'scope.userInfo',
    name: '用户信息',
  },
  'scope.userLocation': {
    mp: 'scope.userLocation',
    iosFunc: judgeIosPermissionLocation, // 对应 js_sdk/permission.js 中的函数
    androidKey: 'ACCESS_FINE_LOCATION', // 对应 Android 权限字符串（在 Android 请求时使用）
    name: '地理位置',
  },
  'scope.camera': {
    mp: 'scope.camera',
    iosFunc: judgeIosPermissionCamera,
    androidKey: 'CAMERA',
    name: '相机',
  },
  'scope.writePhotosAlbum': {
    mp: 'scope.writePhotosAlbum',
    iosFunc: judgeIosPermissionPhotoLibrary,
    androidKey: 'WRITE_EXTERNAL_STORAGE', // 通常保存图片需要写权限，对应 Android Manifest 中的权限
    name: '相册',
  },
  'scope.record': {
    mp: 'scope.record',
    iosFunc: judgeIosPermissionRecord,
    androidKey: 'RECORD_AUDIO',
    name: '麦克风',
  },
  'scope.push': { // App 平台特有
    iosFunc: judgeIosPermissionPush,
    androidKey: 'POST_NOTIFICATIONS', // Android 13+ 推送权限，之前无需运行时权限
    name: '消息推送',
  },
  'scope.contacts': {
      iosFunc: judgeIosPermissionContact,
      androidKey: 'READ_CONTACTS', // Android 通讯录读取权限
      name: '通讯录'
  },
  'scope.calendar': {
      iosFunc: judgeIosPermissionCalendar,
      androidKey: 'READ_CALENDAR', // Android 日历读取权限
      name: '日历'
  },
  'scope.memo': {
      iosFunc: judgeIosPermissionMemo,
      // Android 暂时没有直接对应备忘录的系统权限，或需特定 SDK
      name: '备忘录'
  },
};

/**
 * 统一的权限检查和请求方法。
 * 根据当前运行平台智能选择权限处理逻辑（小程序、App-iOS、App-Android、H5）。
 * 成功时 resolve(true)，失败时 reject(Error)。
 *
 * @param {string} scope - 统一的权限标识符，例如 'scope.userLocation', 'scope.camera'。
 * @param {string} [name='所需功能'] - 权限的友好名称，用于用户提示。
 * @returns {Promise<boolean>} Promise 结果：成功返回 true，失败返回 Error 对象。
 */
export async function checkAndRequestPermission(scope, name = '所需功能') {
  const permissionConfig = PERMISSION_MAP[scope];

  if (!permissionConfig) {
    console.warn(`[PermissionManager] 未知的权限 scope: ${scope}`);
    return Promise.reject(new Error(`未知权限类型: ${scope}`));
  }

  const permissionName = permissionConfig.name || name;

  // --- 小程序平台逻辑 ---
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
  const mpScope = permissionConfig.mp;
  if (!mpScope) {
    console.warn(`[PermissionManager] 小程序平台不支持 ${scope} 权限`);
    return Promise.reject(new Error(`小程序平台不支持该权限: ${scope}`));
  }

  try {
    const setting = await uni.getSetting();
    const authStatus = setting.authSetting[mpScope];

    if (authStatus === true) {
      // 已经授权
      return true;
    } else if (authStatus === false) {
      // 曾经拒绝授权，引导用户进入设置页面
      await new Promise((resolveModal, rejectModal) => {
        uni.showModal({
          title: '授权提示',
          content: `亲爱的用户，为了能让您使用${permissionName}功能，请您前往小程序右上角的设置项，把${permissionName}开启后再试试哦。`,
          confirmText: '去设置',
          confirmColor: '#465CFF',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting[mpScope]) {
                    resolveModal(true); // 用户在设置页开启了权限
                  } else {
                    console.warn(`[${permissionName}] 用户未在设置页打开权限`);
                    rejectModal(new Error('用户未在设置页打开权限'));
                  }
                },
                fail: (err) => {
                  console.error(`[${permissionName}] 打开设置页失败`, err);
                  rejectModal(new Error('打开设置页失败'));
                }
              });
            } else {
              console.warn(`[${permissionName}] 用户取消进入设置页`);
              rejectModal(new Error('用户取消进入设置页'));
            }
          },
          fail: (err) => {
            console.error(`[${permissionName}] 显示授权提示模态框失败`, err);
            rejectModal(new Error('显示授权提示模态框失败'));
          }
        });
      });
      return true; // 如果 Promise 成功，意味着权限已获取或用户已去设置
    } else {
      // 首次授权或未曾请求授权，直接请求授权
      await new Promise((resolveAuth, rejectAuth) => {
        uni.authorize({
          scope: mpScope,
          success: () => {
            resolveAuth(true); // 授权成功
          },
          fail: (err) => {
            console.warn(`[${permissionName}] 小程序授权失败，用户可能拒绝`, err);
            rejectAuth(new Error('用户拒绝授权或授权失败')); // 授权失败 (用户点击了拒绝)
          }
        });
      });
      return true;
    }
  } catch (error) {
    console.error(`[${permissionName}] 获取小程序授权状态或请求失败`, error);
    return Promise.reject(new Error(`获取小程序授权状态或请求失败: ${error.message}`));
  }
  // #endif

  // --- APP 平台逻辑 ---
  // #ifdef APP-PLUS
  if (isIos) {
    const iosFunc = permissionConfig.iosFunc;
    if (!iosFunc || typeof iosFunc !== 'function') {
      console.warn(`[PermissionManager] iOS 平台没有为 ${scope} 配置有效的权限判断函数`);
      return Promise.reject(new Error(`iOS 平台不支持 ${scope} 权限检查或未配置`));
    }

    let hasPermission = iosFunc(); // 调用 js_sdk/permission.js 中的 iOS 原生判断函数
    if (hasPermission) {
      return true;
    } else {
      // 权限未开启，引导用户去系统设置
      await new Promise((resolveModal, rejectModal) => {
        uni.showModal({
          title: '授权提示',
          content: `亲爱的用户，为了能让您使用${permissionName}功能，请您前往设备的系统设置中，把${permissionName}权限开启后再试试哦。`,
          confirmText: '去设置',
          confirmColor: '#465CFF',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.openAppAuthorizeSetting({
                success: () => {
                  // 用户去设置了。这里假定用户会开启，后续操作继续。
                  // 如果需要严格判断，可以在 openAppAuthorizeSetting 回调后再次调用 iosFunc() 检查
                  resolveModal(true);
                },
                fail: (err) => {
                  console.error(`[${permissionName}] 打开App系统设置失败`, err);
                  rejectModal(new Error('打开App系统设置失败'));
                }
              });
            } else {
              console.warn(`[${permissionName}] 用户取消打开App系统设置`);
              rejectModal(new Error('用户取消打开App系统设置'));
            }
          },
          fail: (err) => {
            console.error(`[${permissionName}] 显示授权提示模态框失败`, err);
            rejectModal(new Error('显示授权提示模态框失败'));
          }
        });
      });
      return true; // 假定用户选择去设置后可能成功
    }
  } else {
    // Android 权限判断和请求
    const androidKey = permissionConfig.androidKey;
    if (!androidKey) {
      console.warn(`[PermissionManager] Android 平台没有为 ${scope} 配置权限键`);
      return Promise.reject(new Error(`Android 平台不支持 ${scope} 权限检查或未配置`));
    }

    // 从您的 permissionMap 中获取 Android 权限字符串
    const androidPermissionStrings = permissionMap.android[androidKey]?.name;
    if (!androidPermissionStrings) {
      console.warn(`[PermissionManager] Android 权限映射表中未找到 ${androidKey} 的具体权限字符串`);
      return Promise.reject(new Error(`Android 权限映射配置错误: ${androidKey}`));
    }

    // 检查当前权限状态 (不会触发系统弹窗)
    let isFullyGranted = true;
    const permissionArray = androidPermissionStrings.split(',');
    for (const perm of permissionArray) {
        const status = plus.navigator.checkPermission(perm);
        if (status === 'denied' || status === 'undetermined') {
            isFullyGranted = false;
            break;
        }
    }

    if (isFullyGranted) {
      return true; // 已完全授权
    } else {
      // 未完全授权，先显示权限说明弹窗（可以根据您的 js_sdk/permission.js 中的 showViewDesc）
      // 这里用一个简化的 uni.showModal 代替您的 `plus.nativeObj.View` 弹窗
      // **重要：** 如果您希望使用 `plus.nativeObj.View` 的原生弹窗，
      // 您需要在 `js_sdk/permission.js` 中确保 `showViewDesc` 可被调用，
      // 并且处理其生命周期（如 `view.close()`）。
      // 鉴于 `plus.nativeObj.View` 的复杂性，此处使用 `uni.showModal` 模拟。
      await showAndroidPermissionRationale(androidKey, permissionName); // 简化的提示

      // 然后发起 Android 权限请求
      const requestResult = await requestAndroidPermission(androidPermissionStrings); // 调用 js_sdk/permission.js 中的函数

      // 如果有原生 view 需要关闭，在这里处理。
      // 例如：if (view && view.close) view.close(); // 这取决于您的 js_sdk/permission.js 内部实现

      if (requestResult === 1) {
        return true; // 授权成功
      } else if (requestResult === -1) {
        // 永久拒绝，引导用户去应用设置
        await new Promise((resolveModal, rejectModal) => {
          uni.showModal({
            title: '提示',
            content: `操作权限已被拒绝，请手动前往设置页面开启${permissionName}权限。`,
            confirmText: '立即设置',
            success: (res) => {
              if (res.confirm) {
                uni.openAppAuthorizeSetting({
                    success: () => resolveModal(true), // 用户去设置了，假设会开启
                    fail: (err) => rejectModal(new Error('打开App设置失败'))
                });
              } else {
                rejectModal(new Error('用户取消进入设置'));
              }
            },
            fail: (err) => {
                console.error('显示模态框失败', err);
                rejectModal(new Error('显示模态框失败'));
            }
          });
        });
        return true; // 假定用户选择去设置后可能成功
      } else {
        // 本次拒绝或请求失败
        console.warn(`[${permissionName}] Android 权限请求失败或被拒绝，结果：${requestResult}`);
        return Promise.reject(new Error('用户拒绝或权限请求失败'));
      }
    }
  }
  // #endif

  // --- H5 平台逻辑 ---
  // #ifdef H5
  console.warn(`[PermissionManager] H5 端权限处理受浏览器限制，无法主动请求或引导用户。`);
  // H5 权限通常由浏览器在使用 API 时自动弹窗。这里乐观地返回 true。
  return true;
  // #endif
}


/**
 * 获取用户地理位置信息的完整流程。
 * 包含平台权限授权、设备定位服务检查和详细错误处理。
 *
 * @returns {Promise<Object>} 成功时返回位置数据，失败时拒绝 Error 对象。
 */
export async function getAccurateUserLocationExt() {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. 调用通用的权限方法，请求地理位置权限
            // 这会处理小程序端的 scope.userLocation 和 App 端的原生定位权限
            const authSuccess = await checkAndRequestPermission('scope.userLocation', '地理位置');

            if (!authSuccess) {
                // 如果 checkAndRequestPermission 拒绝，则流程中断，这里仅作兜底
                reject(new Error('地理位置权限未授权'));
                return;
            }

            // 2. 权限已授权，进一步检查设备系统定位服务是否开启 (主要在 APP-PLUS 下有效)
            // #ifdef APP-PLUS
            const systemLocationEnabled = checkSystemEnableLocation(); // 调用 js_sdk/permission.js 中的函数
            if (!systemLocationEnabled) {
                uni.showModal({
                    title: '定位失败',
                    content: '手机定位服务未开启，请前往手机系统设置开启。',
                    confirmText: '去开启', // 实际上无法直接跳转到 GPS 设置，仅作引导
                    cancelText: '取消',
                    success: (modalRes) => {
                        if (modalRes.confirm) {
                            uni.showToast({
                                title: '请手动开启手机定位服务',
                                icon: 'none',
                                duration: 3000
                            });
                        }
                        reject(new Error('手机系统定位服务未开启'));
                    }
                });
                return;
            }
            // #endif

            // 3. 所有前置检查通过，尝试获取地理位置
            uni.showLoading({
                title: '获取位置中...',
                mask: true
            });

            uni.getLocation({
                type: 'gcj02', // 推荐使用国测局坐标系
                geocode: true, // 是否解析地址信息，可能需要额外的服务配置
                success: (res) => {
                    uni.hideLoading();
                    resolve(res); // 成功时返回位置数据
                },
                fail: (err) => {
                    uni.hideLoading();
                    console.error('[uni.getLocation] 失败:', err);
                    let errorMessage = '获取地理位置失败';

                    if (err.errMsg) {
                        if (err.errMsg.includes('fail auth deny') || err.errMsg.includes('fail user deny') || err.errMsg.includes('fail api scope deny') || err.errMsg.includes('ERROR_AUTH_DENIED')) {
                            errorMessage = '用户拒绝了定位请求';
                        } else if (err.errMsg.includes('fail:system permission denied') || err.errMsg.includes('fail gps closed')) {
                            // 虽然前面有检查，但这里是 uni.getLocation 实际反馈的错误
                            errorMessage = '手机定位服务未开启或被禁用';
                            uni.showModal({
                                title: '定位失败',
                                content: '手机定位服务未开启或被禁用，请前往手机系统设置开启定位服务。',
                                confirmText: '去开启',
                                cancelText: '取消',
                                success: (modalRes) => {
                                    if (modalRes.confirm) {
                                        uni.showToast({
                                            title: '请手动开启手机定位服务',
                                            icon: 'none',
                                            duration: 3000
                                        });
                                    }
                                    reject(new Error(errorMessage)); // 依然拒绝 Promise
                                }
                            });
                            return; // 已经处理弹窗，不再继续
                        } else if (err.errMsg.includes('fail no network')) {
                            errorMessage = '网络不佳，无法获取位置';
                        } else if (err.errMsg.includes('fail timeout')) {
                            errorMessage = '获取位置超时，请稍后重试';
                        }
                    }
                    reject(new Error(errorMessage)); // 拒绝 Promise 并附带错误信息
                }
            });

        } catch (error) {
            // 捕获 checkAndRequestPermission 或其他异步操作抛出的错误
            uni.hideLoading(); // 确保隐藏加载提示
            console.error('[getAccurateUserLocationExt] 流程中断:', error);
            reject(error); // 将错误透传给上层调用者
        }
    });
}