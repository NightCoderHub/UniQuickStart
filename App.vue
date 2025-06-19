<script>
import { UnCancelToken, setRouteCancelTokenSource } from "@/utils/request.js";

// 用于在 App.vue 中存储当前的路由取消令牌源
let appGlobalCancelTokenSource = null;

export default {
  onLaunch: function () {
    console.log("App Launch");
    // 应用启动时，初始化第一个路由取消令牌源
    appGlobalCancelTokenSource = UnCancelToken.source();
    setRouteCancelTokenSource(appGlobalCancelTokenSource);

    // --- 关键：监听路由跳转事件或页面生命周期 ---
    // uni-app 没有直接的全局路由守卫
    // 我们可以通过监听页面生命周期的变化来模拟路由切换
    // onHide 表示当前页面或应用进入后台，或者页面被覆盖/卸载
    // 这时可以认为是需要取消上一个页面发出的请求
    uni.addInterceptor("navigateTo", {
      success() {
        if (appGlobalCancelTokenSource) {
          console.log("🛑 路由跳转前，取消当前所有请求...");
          appGlobalCancelTokenSource.cancel("路由切换，自动取消");
        }
        // 创建新的令牌源给新的页面或路由
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
      fail(err) {
        console.error("navigateTo 失败:", err);
        // 失败时也重新生成一个，避免令牌失效导致后续请求无法绑定
        if (appGlobalCancelTokenSource) {
          appGlobalCancelTokenSource.cancel("navigateTo 失败，刷新令牌");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
    });

    uni.addInterceptor("redirectTo", {
      success() {
        if (appGlobalCancelTokenSource) {
          console.log("🛑 路由重定向前，取消当前所有请求...");
          appGlobalCancelTokenSource.cancel("路由重定向，自动取消");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
      fail(err) {
        console.error("redirectTo 失败:", err);
        if (appGlobalCancelTokenSource) {
          appGlobalCancelTokenSource.cancel("redirectTo 失败，刷新令牌");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
    });

    uni.addInterceptor("switchTab", {
      success() {
        if (appGlobalCancelTokenSource) {
          console.log("🛑 Tab 切换前，取消当前所有请求...");
          appGlobalCancelTokenSource.cancel("Tab 切换，自动取消");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
      fail(err) {
        console.error("switchTab 失败:", err);
        if (appGlobalCancelTokenSource) {
          appGlobalCancelTokenSource.cancel("switchTab 失败，刷新令牌");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
    });

    uni.addInterceptor("navigateBack", {
      success() {
        // navigateBack 成功后，通常是返回到上一个页面，上一个页面的 onShow 会触发
        // 这里可以根据实际需要决定是否取消，如果上一个页面需要重新加载数据，可以取消
        if (appGlobalCancelTokenSource) {
          console.log("🛑 返回上一页后，取消当前所有请求...");
          appGlobalCancelTokenSource.cancel("返回上一页，自动取消");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
      fail(err) {
        console.error("navigateBack 失败:", err);
        if (appGlobalCancelTokenSource) {
          appGlobalCancelTokenSource.cancel("navigateBack 失败，刷新令牌");
        }
        appGlobalCancelTokenSource = UnCancelToken.source();
        setRouteCancelTokenSource(appGlobalCancelTokenSource);
      },
    });
  },
  onShow: function () {
    console.log("App Show");
    // 当 App 再次显示时（从后台到前台），确保有一个有效的令牌
    if (!appGlobalCancelTokenSource) {
      appGlobalCancelTokenSource = UnCancelToken.source();
      setRouteCancelTokenSource(appGlobalCancelTokenSource);
    }
  },
  onHide: function () {
    console.log("App Hide");
    // 当 App 进入后台时，取消所有请求，通常在小程序场景下有用
    // 但对于页面跳转，上面的拦截器已经处理了，这里可以作为兜底
    // 如果你希望在应用进入后台时也取消所有请求，可以保留此逻辑
    // if (appGlobalCancelTokenSource) {
    //   console.log('🛑 App 进入后台，取消所有请求...');
    //   appGlobalCancelTokenSource.cancel('App 进入后台');
    //   appGlobalCancelTokenSource = null; // 清空，确保 onShow 会生成新的
    // }
  },
  onError: function (err) {
    console.error("App Error:", err);
  },
  onPageNotFound: function (res) {
    console.warn("Page Not Found:", res);
    uni.redirectTo({
      url: "/pages/404/404", // 跳转到 404 页面
    });
  },
};
</script>

<style>
/*每个页面公共css */
</style>
