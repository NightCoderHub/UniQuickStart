<template>
  <view class="image-uploader">
    <wd-upload
      v-model:file-list="fileList"
      :action="action"
      :header="header"
      :limit="limit"
      :image-mode="imageMode"
      :disabled="disabled"
      :max-size="maxSize"
      multiple
      :before-remove="beforeRemoveHook"
      @success="handleUploadSuccess"
      @fail="handleUploadFail"
      @remove="handleUploadRemove"
      @oversize="handleOverSize"
    >
    </wd-upload>

    <wd-message-box />
    <wd-toast />
  </view>
</template>

<script setup>
import { useMessage, useToast } from "wot-design-uni";
import { uploadActionUrl } from "../../utils/constants.js";

defineOptions({
  name: "ImageUploader",
});

const props = defineProps({
  // 上传地址，默认为系统配置的上传接口
  action: {
    type: String,
    default: uploadActionUrl,
  },
  // 上传请求头部
  header: {
    type: Object,
    default: () => ({
      authorization: `Bearer ${uni.getStorageSync("token") || ""}`,
    }),
  },
  // 最大允许上传个数
  limit: {
    type: Number,
    default: 9,
  },
  // 图片裁剪、缩放的模式
  imageMode: {
    type: String,
    default: "aspectFill",
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 文件大小限制，默认 10MB
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024,
  },
});

const emit = defineEmits(["uploadSuccess", "uploadFail", "remove", "oversize"]);

// 双向绑定文件列表
const fileList = defineModel("fileList", {
  type: Array,
  default: () => [],
});

const messageBox = useMessage();
const toast = useToast();

// 上传成功回调
const handleUploadSuccess = ({ file, fileList: newFileList, formData }) => {
  // 注意：wd-upload 的 v-model 会自动更新 fileList，这里不需要手动赋值
  // 如果需要提示，可以使用 toast，但建议不要太打扰
  // toast.success("上传成功");
  emit("uploadSuccess", { file, fileList: newFileList, formData });
};

// 上传失败回调
const handleUploadFail = ({ error, file, formData }) => {
  toast.error(`上传失败: ${error.errMsg || "未知错误"}`);
  emit("uploadFail", { error, file, formData });
};

// 文件移除回调
const handleUploadRemove = ({ file }) => {
  emit("remove", file);
};

// 文件大小超出限制回调
const handleOverSize = ({ file }) => {
  const maxSizeMB = props.maxSize / 1024 / 1024;
  toast.error(`文件 "${file.name}" 大小超出限制，请上传小于 ${maxSizeMB}MB 的文件`);
  emit("oversize", { file });
};

// 移除图片前置处理
const beforeRemoveHook = ({ file, resolve }) => {
  messageBox
    .confirm({
      msg: `确定要删除图片 "${file.name || "此文件"}" 吗？`,
      title: "提示",
    })
    .then(() => {
      resolve(true); // 确认删除
      toast.success("删除成功");
    })
    .catch(() => {
      resolve(false); // 取消删除
      // 取消删除通常不需要提示，避免打扰用户
    });
};
</script>

<style lang="scss" scoped>
.image-uploader {
  /* 可以添加一些自定义样式来包裹 wd-upload */
}
</style>
