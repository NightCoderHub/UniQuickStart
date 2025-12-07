<template>
  <view class="image-uploader">
    <wd-upload
      v-model:file-list="internalFileList"
      :action="uploadAction"
      :limit="maxLimit"
      :image-mode="imageMode"
      :disabled="disabled"
      multiple
      :before-remove="beforeRemoveHook"
      @change="handleUploadChange"
      @success="handleUploadSuccess"
      @fail="handleUploadFail"
      @remove="handleUploadRemove"
      @oversize="handleOverSize"
    >
    </wd-upload>

    <wd-message-box></wd-message-box>
    <wd-toast></wd-toast>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import { useMessage, useToast } from "wot-design-uni";

const messageBox = useMessage();
const toast = useToast();

// 定义 props
const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  action: {
    type: String,
    required: true, // 上传地址是必需的
  },
  limit: {
    type: Number,
    default: 9, // 默认最大上传9张
  },
  imageMode: {
    type: String,
    default: "aspectFill",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 定义 emits
const emit = defineEmits(["update:fileList", "uploadSuccess", "uploadFail", "remove"]);

// 内部维护的文件列表
const internalFileList = ref([]);

// 监听外部传入的 fileList，同步到内部
watch(
  () => props.fileList,
  (newVal) => {
    internalFileList.value = newVal;
  },
  { immediate: true, deep: true },
);

// 将 props 转换为内部使用的变量名
const uploadAction = ref(props.action);
const maxLimit = ref(props.limit);

// 处理文件列表变化（v-model 模式下可能不需要，但为了兼容和明确，保留）
const handleUploadChange = ({ fileList }) => {
  console.log("文件列表变化:", fileList);
  // 通过 emit 更新父组件的 fileList
  emit("update:fileList", fileList);
};

// 上传成功回调
const handleUploadSuccess = ({ file, fileList, formData }) => {
  console.log("上传成功:", file);
  toast.success("上传成功");
  emit("uploadSuccess", { file, fileList, formData });
};

// 上传失败回调
const handleUploadFail = ({ error, file, formData }) => {
  console.error("上传失败:", error);
  toast.error(`上传失败: ${error.errMsg || "未知错误"}`);
  emit("uploadFail", { error, file, formData });
};

// 文件移除回调
const handleUploadRemove = ({ file }) => {
  console.log("文件被移除:", file);
  emit("remove", file);
};

// 文件大小超出限制回调
const handleOverSize = ({ file }) => {
  toast.error(`文件 "${file.name}" 大小超出限制，请上传小于 ${props.maxSize / 1024 / 1024}MB 的文件`);
};

// 移除图片前置处理（示例：询问是否删除）
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
      toast.show("已取消删除操作");
    });
};
</script>

<style lang="scss" scoped>
.image-uploader {
  /* 可以添加一些自定义样式来包裹 wd-upload */
  // .custom-upload-btn {
  //   width: 180rpx;
  //   height: 180rpx;
  //   background: #f5f5f5;
  //   border: 2rpx dashed #d9d9d9;
  //   border-radius: 16rpx;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  // }
}
</style>
