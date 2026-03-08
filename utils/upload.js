/**
 * 封装上传文件
 * @param {String} url 接口地址
 * @param {String} filePath 文件临时路径
 * @param {Object} formData 额外表单数据
 */
import { uploadActionUrl } from "./constants";
export const uploadFile = (url, filePath, formData = {}) => {
  // 获取存储的 token
  const token = uni.getStorageSync("token");

  return new Promise((resolve, reject) => {
    // 开启全局加载圈
    uni.showLoading({ title: "上传中...", mask: true });

    uni.uploadFile({
      url: url !== "" ? url : uploadActionUrl,
      filePath: filePath,
      name: "file",
      header: {
        authorization: `${token}`,
      },
      formData: formData,
      success: (res) => {
        // uni.uploadFile 返回的 res.data 是字符串，需要手动转换
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          // data.data的数据结构是 {url: string, size:number}
          resolve(data.data);
        } else {
          uni.showToast({ title: data.message || "上传失败", icon: "none" });
          reject(data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: "网络异常，请重试", icon: "none" });
        reject(err);
      },
      complete: () => {
        uni.hideLoading();
      },
    });
  });
};
