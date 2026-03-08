<template>
  <wd-tabbar
    v-model="activeTab"
    :fixed="fixed"
    placeholder
    bordered
    safe-area-inset-bottom
    active-color="#4C92FC"
    inactive-color="#808080"
    @change="onTabbarChange"
  >
    <wd-tabbar-item v-for="item in tabbarList" :key="item.pagePath" :title="item.text" :name="item.pagePath">
      <template #icon="{ active }">
        <wd-img v-if="active" height="46rpx" width="46rpx" :src="'/' + item.selectedIconPath"></wd-img>
        <wd-img v-else height="46rpx" width="46rpx" :src="'/' + item.iconPath"></wd-img>
      </template>
    </wd-tabbar-item>
  </wd-tabbar>
</template>

<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app"; // 引入页面生命周期
import { useUserStore } from "@/stores"; // 导入用户状态管理

// 获取用户状态
const userStore = useUserStore();

// 防抖函数
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

const tabbarList = [
  {
    pagePath: "pages/index/index",
    text: "首页",
    iconPath: "static/tabbar/home.png",
    selectedIconPath: "static/tabbar/home_selected.png",
  },
  {
    pagePath: "pages/me/index",
    text: "我的",
    iconPath: "static/tabbar/me.png",
    selectedIconPath: "static/tabbar/me_selected.png",
  },
];
// 定义组件的 props
const props = defineProps({
  // 当前激活的 tabbar 路径 (用于v-model双向绑定)
  currentPath: {
    type: String,
    default: "",
  },
  // 是否开启点击拦截功能
  enableIntercept: {
    type: Boolean,
    default: true,
  },

  // 是否固定在底部
  fixed: {
    type: Boolean,
    default: true,
  },
});

// 定义组件可以触发的事件
const emit = defineEmits(["update:currentPath", "beforeTabChange", "afterTabChange"]);

// 内部维护的 activeTab 状态，通过计算属性与 props.currentPath 双向绑定
const activeTab = computed({
  get() {
    return props.currentPath;
  },
  set(val) {
    emit("update:currentPath", val);
  },
});

// 定义原始的tabbar切换处理函数
const handleTabbarChange = (e) => {
  const targetPath = e.value; // 获取点击的 item 的 value，即 pagePath

  if (props.enableIntercept) {
    // 触发拦截前事件，允许父组件进行拦截判断
    emit("beforeTabChange", targetPath);

    // 获取浏览模式状态
    const browsingMode = uni.getStorageSync("browsing_mode");

    // 需要登录才能访问的页面路径
    const requireLoginPages = ["pages/me/index", "pages/technician-list/technician-list", "pages/community-feed/community-feed"];

    // 检查是否是需要登录的页面
    const needsLogin = requireLoginPages.includes(targetPath);

    // 如果处于浏览模式，并且目标页面是需要登录或限制的页面
    if (browsingMode && needsLogin) {
      uni.showToast({
        title: "浏览模式下无法访问此功能，请登录",
        icon: "none",
        duration: 2000, // 提示持续时间
      });
      // 阻止跳转，并保持当前tabbar选中状态不变
      activeTab.value = currentPageRoute.value; // 恢复到当前页面的路由

      // 设置定时器，延迟跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/login/index", // 登录页面的路径
        });
      }, 2000); // 2秒后跳转

      return;
    }
    console.log("userStore", userStore);
    // 检查用户是否已登录（非浏览模式下）
    if (!browsingMode && needsLogin && !userStore.isLoggedIn) {
      uni.showToast({
        title: "请先登录后再访问",
        icon: "none",
        duration: 2000,
      });

      // 阻止跳转，并保持当前tabbar选中状态不变
      activeTab.value = currentPageRoute.value;

      // 延迟跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/login/index",
        });
      }, 2000);

      return;
    }
  }

  // 执行页面跳转
  // uni.switchTab 只能跳转到 tabBar 页面，且不能带参数
  const currentPages = getCurrentPages();
  const currentPage = currentPages[currentPages.length - 1];

  if (currentPage && currentPage.route === targetPath) {
    // 如果点击的是当前页面对应的 tab，则不进行跳转，避免重复加载
    console.log(`当前已在页面：${targetPath}`);
    emit("afterTabChange", targetPath); // 即使没跳转也通知一声
    return;
  }

  uni.switchTab({
    url: `/${targetPath}`, // wd-tabbar-item 的 value 应该直接是 pagePath
    success: () => {
      console.log(`成功跳转到 ${targetPath}`);
      activeTab.value = targetPath; // 更新 activeTab
      emit("afterTabChange", targetPath); // 通知父组件跳转完成
    },
    fail: (err) => {
      console.error(`跳转到 ${targetPath} 失败:`, err);
      // 失败时，可能需要将 activeTab 还原回之前的页面，或者根据错误类型处理
      // uni.showToast({
      //     title: '页面跳转失败，请稍后重试',
      //     icon: 'none'
      // });
    },
  });
};

// 监听 wd-tabbar 的 change 事件 (使用防抖包装)
const onTabbarChange = debounce(handleTabbarChange, 300);

// 监听当前页面路由变化，更新 activeTab
// Uniapp 页面组件没有路由守卫，但可以通过监听路由变化来同步tabbar状态
// 这里可以监听页面的 onShow 生命周期来获取当前路由
let currentPageRoute = ref("");
onShow(() => {
  uni.hideTabBar();
  const pages = getCurrentPages();
  const currentRoute = pages[pages.length - 1].route;
  currentPageRoute.value = currentRoute;

  // 确保 tabbar 选中项与当前页面路由一致
  const matchedItem = tabbarList.find((item) => item.pagePath === currentRoute);
  if (matchedItem && activeTab.value !== matchedItem.pagePath) {
    activeTab.value = matchedItem.pagePath;
  }
});

// 向外暴露一些方法或属性 (如果需要父组件直接调用)
defineExpose({
  setActiveTab: (path) => {
    activeTab.value = path;
  },
});
</script>

<style lang="scss" scoped>
/* 这里可以放置 CustomTabbar 自身的样式，例如调整 tabbar 的背景色、边框等 */

/* wd-tabbar 已经提供了很多样式控制的 props，通常不需要额外设置 */

.action-modal-wrapper {
  /* 确保弹窗样式不与 tabbar 冲突 */
}
</style>
