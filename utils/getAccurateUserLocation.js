import { requestAuth } from '@/utils/auth.js'; // 假设您的通用授权方法

/**
 * 获取用户地理位置信息的完整流程
 * 包含小程序授权和设备定位服务检查
 * @returns {Promise<Object>} 成功时返回位置数据，失败时拒绝错误对象
 */
async function getAccurateUserLocation() {
  return new Promise(async (resolve, reject) => {
    // 1. 调用通用的授权方法，请求小程序端的地理位置权限
    let authSuccess;
    try {
      authSuccess = await requestAuth('scope.userLocation', '地理位置');
    } catch (authError) {
      // requestAuth 内部已经处理了用户拒绝授权的弹窗和提示
      // 这里只需将错误抛出，让上层捕获
      console.error('小程序地理位置授权失败:', authError.message);
      reject(new Error(`小程序地理位置授权失败: ${authError.message}`));
      return;
    }

    if (!authSuccess) {
      // 理论上 requestAuth 失败会进入 catch 块，这里是再次确认
      console.log('用户明确拒绝了小程序地理位置授权');
      uni.showToast({
        title: '请授权地理位置',
        icon: 'none'
      });
      reject(new Error('用户拒绝小程序地理位置授权'));
      return; // 授权失败，直接返回
    }

    // 2. 小程序授权成功后，尝试获取地理位置
    uni.showLoading({
      title: '获取位置中...',
      mask: true // 增加遮罩，防止用户误操作
    });

    uni.getLocation({
      type: 'gcj02', // 推荐使用国测局坐标
      geocode: true, // 是否解析地址信息，需要额外的服务，如腾讯地图或高德地图SDK配置
      success: (res) => {
        uni.hideLoading();
        console.log('地理位置获取成功：', res);
        uni.showToast({
          title: '位置获取成功',
          icon: 'success'
        });
        // 成功时 resolve 位置数据
        resolve(res);
      },
      fail: (err) => {
        uni.hideLoading();
        console.error('地理位置获取失败：', err);

        let errorMessage = '获取地理位置失败';
        if (err.errMsg) {
          if (err.errMsg.includes('fail:system permission denied') || err.errMsg.includes('fail gps closed')) {
            errorMessage = '请检查手机定位服务是否开启';
            uni.showModal({
              title: '定位失败',
              content: '手机定位服务未开启或被禁用，请前往手机系统设置开启定位服务。',
              confirmText: '去开启',
              cancelText: '取消',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 引导用户手动开启，无法直接跳转GPS设置
                  uni.showToast({
                    title: '请手动开启手机定位服务',
                    icon: 'none',
                    duration: 3000
                  });
                }
                // 即使弹窗让用户去设置，当前操作依然失败，需要 reject
                reject(new Error('手机定位服务未开启'));
              },
              fail: () => {
                 // showModal 自身失败，也视为定位失败
                 reject(new Error('手机定位服务未开启 (showModal fail)'));
              }
            });
            return; // 弹窗已处理错误，这里结束
          } else if (err.errMsg.includes('fail auth deny') || err.errMsg.includes('fail user deny') || err.errMsg.includes('fail api scope deny') || err.errMsg.includes('fail:getLocation:fail:ERROR_AUTH_DENIED')) {
            errorMessage = '用户取消了定位授权';
          } else if (err.errMsg.includes('fail no network')) {
            errorMessage = '网络不佳，请检查网络连接';
          } else if (err.errMsg.includes('fail timeout')) {
            errorMessage = '获取位置超时，请稍后重试';
          }
        }
        // 其他情况的错误，直接 reject
        reject(new Error(errorMessage));
      }
    });
  });
}

// --- 调用示例 ---
// async function handleLocationData() {
//   try {
//     const locationData = await getAccurateUserLocation();
//     console.log('在业务逻辑中成功获取到位置：', locationData);
//     // 在这里使用 locationData 进行您的业务处理，例如：
//     // uni.showToast({ title: `您的位置：${locationData.address.city}`, icon: 'none' });
//     // 发送位置到服务器等等
//   } catch (error) {
//     console.error('在业务逻辑中处理位置获取失败：', error.message);
//     // 根据 error.message 提供更具体的失败反馈给用户
//     // uni.showToast({ title: `获取位置失败: ${error.message}`, icon: 'none' });
//   }
// }

// 调用函数来启动流程
// handleLocationData();