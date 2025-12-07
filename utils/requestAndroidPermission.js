import { defaultPermissionExplainMap } from "./defaultPermissionExplainMap";
// popup.js content (此处包含，以便自包含)
/**
 * @description: 创建一个原生弹窗
 * @param {*} options
 * @return {*}
 */
export class NativePopup {
  constructor(options = {}) {
    this.sysInfo = uni.getSystemInfoSync();

    const { bgColor = "#fff", titleColor = "#000", contentColor = "#272727" } = options;

    this.bgColor = bgColor;
    this.titleColor = titleColor;
    this.contentColor = contentColor;
    this.popupView = null; // 初始化弹窗视图
  }

  createPopup = () => {
    const { statusBarHeight, screenWidth } = this.sysInfo;

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
