//  Android权限申请说明映射表
const defaultPermissionExplainMap = {
  "android.permission.BLUETOOTH_SCAN": {
    title: "蓝牙扫描权限申请说明",
    content: "应用需要扫描附近的蓝牙设备，以便进行连接或数据传输。",
    name: "蓝牙扫描",
  },
  "android.permission.BLUETOOTH_CONNECT": {
    title: "蓝牙连接权限申请说明",
    content: "应用需要连接蓝牙设备，以便提供音频播放或数据通信功能。",
    name: "蓝牙连接",
  },
  "android.permission.READ_MEDIA_IMAGE": {
    title: "读取图片权限申请说明",
    content: "应用需要访问您的图片库，以便加载和选择照片。",
    name: "读取图片",
  },
  "android.permission.READ_MEDIA_IMAGES": {
    title: "读取图片权限申请说明",
    content: "应用需要访问您的图片库，以便加载和选择照片。",
    name: "读取图片",
  },
  "android.permission.READ_MEDIA_VIDEO": {
    title: "读取视频权限申请说明",
    content: "应用需要访问您的视频库，以便播放和选择视频文件。",
    name: "读取视频",
  },
  "android.permission.READ_MEDIA_AUDIO": {
    title: "读取音频权限申请说明",
    content: "应用需要访问您的音频文件，以便播放音乐或录音。",
    name: "读取音频",
  },
  "android.permission.CALL_PHONE": {
    title: "拨打电话权限申请说明",
    content: "应用需要拨打电话权限，以便直接拨打联系人或客服热线。",
    name: "拨打电话",
  },
  "android.permission.INTERNET": {
    title: "网络权限申请说明",
    content: "应用需要访问网络，以提供最新的内容和服务。",
    name: "网络",
  },
  "android.permission.READ_EXTERNAL_STORAGE": {
    title: "存储读取权限申请说明",
    content: "应用需要读取您的存储，以便加载图片、视频等多媒体文件。",
    name: "存储读取",
  },
  "android.permission.WRITE_EXTERNAL_STORAGE": {
    title: "存储写入权限申请说明",
    content: "应用需要写入您的存储，以便保存图片、视频等多媒体文件。",
    name: "存储写入",
  },
  "android.permission.READ_PHONE_STATE": {
    title: "设备信息权限申请说明",
    content: "应用需要访问设备信息，以便提供更好的用户体验。",
    name: "设备信息",
  },
  "android.permission.ACCESS_NETWORK_STATE": {
    title: "网络状态权限申请说明",
    content: "应用需要获取网络状态，以便优化网络请求。",
    name: "网络状态",
  },
  "android.permission.ACCESS_WIFI_STATE": {
    title: "WiFi 状态权限申请说明",
    content: "应用需要获取 WiFi 状态，以便优化网络连接。",
    name: "WiFi 状态",
  },
  "android.permission.CAMERA": {
    title: "相机权限申请说明",
    content: "应用需要访问您的相机，以便拍摄照片或扫描二维码。",
    name: "相机",
  },
  "android.permission.ACCESS_COARSE_LOCATION": {
    title: "定位权限申请说明",
    content: "应用需要获取您的大致位置信息，以便提供基于位置的服务。",
    name: "大致定位",
  },
  "android.permission.ACCESS_FINE_LOCATION": {
    title: "精确定位权限申请说明",
    content: "应用需要获取您的精确位置信息，以便提供导航等精准服务。",
    name: "精确定位",
  },
  "android.permission.ACCESS_LOCATION_EXTRA_COMMANDS": {
    title: "额外定位权限申请说明",
    content: "应用需要使用额外的定位功能，以提升定位精度。",
    name: "额外定位",
  },
  "android.permission.ACCESS_MOCK_LOCATION": {
    title: "模拟定位权限申请说明",
    content: "应用需要访问模拟位置，以便进行测试或特定功能。",
    name: "模拟定位",
  },
  "android.permission.READ_CONTACTS": {
    title: "读取联系人权限申请说明",
    content: "应用需要读取您的联系人信息，以便提供通讯录相关功能。",
    name: "读取联系人",
  },
  "android.permission.WRITE_CONTACTS": {
    title: "写入联系人权限申请说明",
    content: "应用需要写入您的联系人信息，以便管理通讯录。",
    name: "写入联系人",
  },
  "android.permission.BLUETOOTH": {
    title: "蓝牙权限申请说明",
    content: "应用需要访问蓝牙功能，以便连接设备或传输数据。",
    name: "蓝牙",
  },
  "android.permission.BLUETOOTH_ADMIN": {
    title: "蓝牙管理权限申请说明",
    content: "应用需要管理蓝牙功能，以便优化连接体验。",
    name: "蓝牙管理",
  },
  "android.permission.RECEIVE_SMS": {
    title: "短信接收权限申请说明",
    content: "应用需要读取短信，以便自动填充验证码或提供相关功能。",
    name: "短信接收",
  },
  "android.permission.SEND_SMS": {
    title: "短信发送权限申请说明",
    content: "应用需要发送短信，以便提供短信验证等功能。",
    name: "短信发送",
  },
  "android.permission.WRITE_SMS": {
    title: "短信写入权限申请说明",
    content: "应用需要写入短信，以便存储和管理您的短信信息。",
    name: "短信写入",
  },
  "android.permission.READ_SMS": {
    title: "短信读取权限申请说明",
    content: "应用需要读取短信，以便自动填充验证码或提供相关功能。",
    name: "短信读取",
  },
  "android.permission.INSTALL_PACKAGES": {
    title: "安装应用权限申请说明",
    content: "应用需要安装其他应用，以便提供扩展功能。",
    name: "安装应用",
  },
  "android.permission.REQUEST_INSTALL_PACKAGES": {
    title: "安装包权限申请说明",
    content: "应用需要请求安装应用包权限，以便下载安装更新。",
    name: "安装包",
  },
  "com.android.launcher.permission.INSTALL_SHORTCUT": {
    title: "创建快捷方式权限申请说明",
    content: "应用需要创建桌面快捷方式，以便您快速访问应用。",
    name: "创建快捷方式",
  },
  "com.android.launcher.permission.UNINSTALL_SHORTCUT": {
    title: "删除快捷方式权限申请说明",
    content: "应用需要删除桌面快捷方式，以便管理您的快捷方式。",
    name: "删除快捷方式",
  },
  "android.permission.RECORD_AUDIO": {
    title: "麦克风权限申请说明",
    content: "应用需要访问麦克风，以便进行语音输入或语音通话。",
    name: "麦克风",
  },
  "android.permission.MODIFY_AUDIO_SETTINGS": {
    title: "音频设置修改权限申请说明",
    content: "应用需要修改音频设置，以便优化音量或声音效果。",
    name: "修改音频设置",
  },
  "android.permission.GET_ACCOUNTS": {
    title: "账户权限申请说明",
    content: "应用需要访问您的账户信息，以便提供个性化服务。",
    name: "账户",
  },
  "android.permission.USE_FINGERPRINT": {
    title: "指纹识别权限申请说明",
    content: "应用需要使用指纹识别，以便进行身份验证。",
    name: "指纹识别",
  },
  "android.permission.USE_BIOMETRIC": {
    title: "生物识别权限申请说明",
    content: "应用需要使用生物识别功能（如面部识别），以便进行身份验证。",
    name: "生物识别",
  },
  "android.permission.READ_CALENDAR": {
    title: "读取日历权限申请说明",
    content: "应用需要读取您的日历，以便提供日程管理功能。",
    name: "读取日历",
  },
  "android.permission.WRITE_CALENDAR": {
    title: "写入日历权限申请说明",
    content: "应用需要写入您的日历，以便添加或修改日程。",
    name: "写入日历",
  },
  "android.permission.READ_CALL_LOG": {
    title: "读取通话记录权限申请说明",
    content: "应用需要访问通话记录，以便提供通话管理或统计功能。",
    name: "读取通话记录",
  },
  "android.permission.WRITE_CALL_LOG": {
    title: "写入通话记录权限申请说明",
    content: "应用需要写入通话记录，以便管理通话历史。",
    name: "写入通话记录",
  },
  "android.permission.PROCESS_OUTGOING_CALLS": {
    title: "处理拨出电话权限申请说明",
    content: "应用需要访问拨出电话，以便提供通话拦截或号码识别功能。",
    name: "处理拨出电话",
  },
  "android.permission.BODY_SENSORS": {
    title: "传感器权限申请说明",
    content: "应用需要访问您的传感器数据，以便提供健康或运动相关功能。",
    name: "传感器",
  },
  "android.permission.ACTIVITY_RECOGNITION": {
    title: "活动识别权限申请说明",
    content: "应用需要访问您的活动状态，以便提供运动检测等功能。",
    name: "活动识别",
  },
  "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS": {
    title: "电池优化忽略权限申请说明",
    content: "应用需要忽略电池优化，以便在后台稳定运行。",
    name: "忽略电池优化",
  },
  "android.permission.FOREGROUND_SERVICE": {
    title: "前台服务权限申请说明",
    content: "应用需要运行前台服务，以便提供持续运行的功能，如音乐播放、导航等。",
    name: "前台服务",
  },
  "android.permission.SYSTEM_ALERT_WINDOW": {
    title: "悬浮窗权限申请说明",
    content: "应用需要显示悬浮窗，以便提供浮动窗口功能，如聊天气泡、屏幕录制等。",
    name: "悬浮窗",
  },
  "android.permission.WRITE_SETTINGS": {
    title: "系统设置修改权限申请说明",
    content: "应用需要修改系统设置，以便调整亮度、铃声等个性化配置。",
    name: "修改系统设置",
  },
};

// popup.js content (此处包含，以便自包含)
/**
 * @description: 创建一个原生弹窗
 * @param {*} options
 * @return {*}
 */
export class NativePopup {
  constructor(options = {}) {
    const { bgColor = "#fff", titleColor = "#000", contentColor = "#272727" } = options;

    this.bgColor = bgColor;
    this.titleColor = titleColor;
    this.contentColor = contentColor;
    this.popupView = null; // 初始化弹窗视图
  }

  createPopup = () => {
    const { statusBarHeight, screenWidth } = uni.getWindowInfo();

    // 创建新弹窗前，先关闭任何现有弹窗
    this.close();

    const popupView = new plus.nativeObj.View("popupView", {
      top: 0,
      left: 0,
      width: screenWidth,
      height: 110 + statusBarHeight + "px",
      // backgroundColor: 'blue' // 调试用
    });

    // 添加点击事件监听器，点击弹窗时关闭
    popupView.addEventListener("click", this.close);

    const bgPadding = 15;

    // 绘制阴影/边框矩形
    popupView.drawRect(
      {
        color: "rgba(0, 0, 0, 0.1)",
        radius: "10px",
      },
      {
        top: statusBarHeight + 7 + "px",
        left: bgPadding - 2 + "px",
        width: screenWidth - bgPadding * 2 + 4 + "px",
        height: "100px",
      },
    );

    // 绘制主背景矩形
    popupView.drawRect(
      {
        color: this.bgColor,
        radius: "10px",
      },
      {
        top: statusBarHeight + 5 + "px",
        left: bgPadding + "px",
        width: screenWidth - bgPadding * 2 + "px",
        height: "100px",
      },
    );

    const padding = 10;

    // 绘制标题文本
    popupView.drawText(
      this.title,
      {
        top: statusBarHeight + 10 + "px",
        left: padding + bgPadding + "px",
        height: "30px",
        width: screenWidth - bgPadding * 2 - padding * 2 + "px",
      },
      {
        size: "16px",
        weight: "bold",
        align: "left",
        color: this.titleColor,
      },
      {
        onClick: function (e) {
          console.log(e); // 标题潜在点击操作的占位符
        },
      },
    );

    // 绘制内容文本
    popupView.drawText(
      this.content,
      {
        top: statusBarHeight + 40 + "px",
        height: "60px",
        left: padding + bgPadding + "px",
        width: screenWidth - bgPadding * 2 - padding * 2 + "px",
      },
      {
        size: "14px",
        align: "left",
        color: this.contentColor,
        whiteSpace: "normal",
      },
    );

    this.popupView = popupView;
    return popupView;
  };

  show = (options = {}) => {
    // 在创建弹窗前更新标题和内容
    const { title = "权限申请说明", content = "" } = options;
    this.title = title;
    this.content = content;

    this.createPopup(); // 创建或重新创建弹窗视图
    this.popupView.show(); // 显示创建的弹窗
  };

  close = () => {
    // 如果弹窗存在，则安全关闭
    this.popupView && this.popupView.close();
    this.popupView = null; // 关闭后清除引用
  };
}

// 导出一个 NativePopup 的单一实例
export const popup = new NativePopup();

/**
 * 请求 Android 权限函数 (基于 plus.android.requestPermissions & uni.openAppAuthorizeSetting)
 * 修改点：使用 popup.js 展示权限说明弹窗，以符合华为应用市场要求
 * @param {string} permissionName 单个权限字符串，例如 'android.permission.CAMERA'
 * 注意：权限字符串必须是 Android 官方定义的完整权限名，且已在 manifest.json 中声明。
 * @param {string} permissionDesc 权限说明，用于展示给用户的文案 (应用内部弹窗)
 * @returns {Promise<boolean>} 返回 Promise，表示所有请求的权限是否最终被授权
 */
export function requestAndroidPermission(permissionName, permissionDesc) {
  const permissions = [permissionName]; // 将单个字符串转换为数组以便内部使用
  // 使用权限名作为key，记录是否已展示过权限说明
  const storageKey = `permission_desc_shown_${permissionName}`;

  return new Promise((resolve) => {
    // 检查是否在 App 环境运行
    if (typeof plus === "undefined" || !plus.android) {
      console.warn("当前环境不支持 plus.android 模块，权限请求功能受限。请在 App 环境运行。");
      resolve(false);
      return;
    }

    let explanationContent = defaultPermissionExplainMap[permissionName] || {
      title: "权限申请", // 默认标题
      content: permissionDesc || "应用需要相关权限才能正常运行。", // 默认内容
    };

    // 检查本地存储，看是否已展示过说明弹窗
    const hasShownDesc = uni.getStorageSync(storageKey);

    if (hasShownDesc) {
      console.log(`检测到已展示过权限说明，跳过应用内弹窗。`);
      // 直接执行内部权限请求逻辑
      return requestPermissionInternal(permissions, resolve, storageKey, defaultPermissionExplainMap[permissionName].name);
    } else {
      // D: 展示权限说明弹窗 (使用 popup.js)
      // 注意：popup.show() 是非阻塞的，它会立即显示，然后代码会继续执行
      // 因此，我们在这里立即标记为已展示，然后继续请求系统权限
      popup.show(explanationContent);
      uni.setStorageSync(storageKey, true); // 记录已展示过说明

      // 立即执行内部权限请求逻辑，系统弹窗将随后出现
      requestPermissionInternal(permissions, resolve, storageKey, defaultPermissionExplainMap[permissionName].name);
    }
  });
}

// 提取公共的权限请求逻辑 (略有修改，增加 storageKey 参数)
function requestPermissionInternal(permissions, resolve, storageKey, permissionName) {
  if (!permissionName) {
    console.warn("permissionName 未定义!");
  }
  plus.android.requestPermissions(
    permissions,
    (requestRes) => {
      // 请求完成后，关闭顶部说明弹窗
      popup.close();

      const { granted, deniedPresent, deniedAlways } = requestRes;
      const allRequestedGranted = permissions.every((p) => granted.includes(p));

      if (allRequestedGranted) {
        console.log(`所有请求的权限 ${permissions.join(", ")} 已最终授权。`);
        resolve(true);
      } else if (deniedAlways && deniedAlways.length > 0) {
        console.log(`部分权限被永久拒绝: ${deniedAlways.join(", ")}`);
        // 如果有权限被永久拒绝，清理记录，以便下次仍可提示（包括顶部说明和原生弹窗）
        uni.removeStorageSync(storageKey);

        // 弹出引导用户去设置页面的弹窗 (此弹窗仍使用 uni.showModal 进行交互)
        uni.showModal({
          title: "权限受限",
          content: `您已永久拒绝授权${permissionName}等权限，这将影响部分功能使用。请前往设置页面开启权限。`,
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
                    title: "无法自动跳转，请手动前往系统设置->应用管理->本应用->权限，进行设置",
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
        console.log(`部分权限被临时拒绝: ${deniedPresent ? deniedPresent.join(", ") : "无"}`);
        console.log(`用户拒绝了权限请求，但未选择永久拒绝。`);
        // 如果是临时拒绝，也可以考虑清理记录，以便下次仍可提示顶部说明
        // uni.removeStorageSync(storageKey); // 根据产品需求决定是否清理
        resolve(false);
      }
    },
    (requestError) => {
      // 请求完成后，关闭顶部说明弹窗
      popup.close();
      console.error("请求 Android 权限失败 (API参数错误或内部错误):", requestError);
      // 发生错误，清理记录
      uni.removeStorageSync(storageKey);
      resolve(false);
    },
  );
}

// 流程图
// graph TD
//     A[开始] --> B{检查运行环境}
//     B --> |不支持 plus.android| C[直接返回 false]
//     B --> |环境正常| D{检查本地存储<br>是否已展示过说明}
//     D --> |已展示| E[调用内部请求函数]
//     D --> |未展示| F[展示权限说明弹窗]
//     F --> G[记录已展示状态]
//     G --> E
//     E --> H[调用原生权限请求]
//     H --> I{处理权限结果}
//     I --> |所有权限已授权| J[返回 true]
//     I --> |存在永久拒绝权限| K[清除本地记录]
//     K --> L[引导用户跳转设置]
//     L --> M{用户是否确认}
//     M --> |去设置| N[跳转系统设置]
//     M --> |暂不需要| O[返回 false]
//     I --> |仅临时拒绝| P[返回 false]
//     I --> |请求出错| Q[清除本地记录]
//     Q --> R[返回 false]
