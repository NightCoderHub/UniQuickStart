<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
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
