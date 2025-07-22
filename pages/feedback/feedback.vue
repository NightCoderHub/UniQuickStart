<template>
  <view class="feedback-page">
    <wd-toast></wd-toast>
    <view class="form-section">
      <view class="section-title">您的宝贵意见</view>
      <wd-textarea
        v-model="feedbackContent"
        placeholder="请描述您遇到的问题、建议或对产品的看法（不少于10字）"
        :maxlength="500"
        :auto-height="true"
        show-word-limit
        custom-class="feedback-textarea"
      ></wd-textarea>
    </view>

    <view class="form-section">
      <view class="section-title">联系方式 (可选)</view>
      <wd-input
        v-model="contactInfo"
        placeholder="请输入您的手机号/邮箱/微信，方便我们联系您"
        clearable
        custom-class="contact-input"
      ></wd-input>
    </view>

    <view class="form-section">
      <view class="section-title">上传图片 (可选)</view>
      <view class="upload-area">
        <wd-upload
          :file-list="fileList"
          :limit="3"
          @oversize="handleOverSize"
          @remove="handleRemove"
          @after-read="handleAfterRead"
        />
        <text class="upload-tip">最多可上传3张图片，每张不超过2MB</text>
      </view>
    </view>

    <view class="submit-button-container">
      <wd-button type="primary" size="large" block @click="submitFeedback">
        提交反馈
      </wd-button>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { useToast } from "wot-design-uni"; // 引入 toast 组合式API，如果你的版本不支持，可以继续使用 ref 获取组件实例
const toast = useToast(); // 使用组合式API获取toast实例

const feedbackContent = ref("");
const contactInfo = ref("");
const fileList = ref([]); // 用于存储图片文件列表

// 计算属性：判断提交按钮是否禁用
const isSubmitDisabled = computed(() => {
  return feedbackContent.value.length < 10; // 意见内容少于10个字禁用提交
});

// 处理图片超出大小限制
const handleOverSize = (file) => {
  console.log("文件过大:", file);
  toast.show("文件大小不能超过2MB");
};

// 处理移除图片
const handleRemove = ({ file, index }) => {
  console.log("移除文件:", file, "索引:", index);
  fileList.value.splice(index, 1); // 从文件列表中移除对应文件
};

// 处理读取图片
const handleAfterRead = (event) => {
  const { file } = event.detail;
  // 这里通常会将文件上传到服务器，获取到服务器返回的图片URL后再添加到 fileList 中
  // 模拟上传成功
  console.log("读取到文件:", file);
  fileList.value.push({
    url: URL.createObjectURL(file.file), // 预览URL，实际应用中替换为服务器返回的URL
    status: "success", // 或 'uploading'
    message: "上传中...",
    name: file.file.name,
    type: file.file.type,
    size: file.file.size,
  });

  // 模拟上传过程和结果
  setTimeout(() => {
    const lastFile = fileList.value[fileList.value.length - 1];
    if (lastFile) {
      lastFile.status = "success";
      lastFile.message = "上传成功";
      // lastFile.url = '服务器返回的图片URL'; // 真实场景下更新为服务器返回的URL
    }
  }, 1000);
};

// 提交反馈
const submitFeedback = () => {
  if (isSubmitDisabled.value) {
    toast.show("反馈内容不能少于10个字哦！");
    return;
  }

  // 收集所有数据
  const feedbackData = {
    content: feedbackContent.value,
    contact: contactInfo.value,
    images: fileList.value.map((file) => file.url), // 实际应传递服务器返回的图片URL
  };

  console.log("提交的反馈数据:", feedbackData);

  // 这里模拟API调用
  uni.showLoading({
    title: "提交中...",
    mask: true,
  });

  setTimeout(() => {
    uni.hideLoading();
    // 假设提交成功
    toast.show({
      type: "success",
      message: "反馈已提交，感谢您的宝贵意见！",
      duration: 2000,
      onClose: () => {
        // 提交成功后清空表单或返回上一页
        feedbackContent.value = "";
        contactInfo.value = "";
        fileList.value = [];
        uni.navigateBack(); // 返回上一页
      },
    });
  }, 1500);

  // 真实场景中，你会在这里发送HTTP请求到后端API
  // 例如：uni.request({ url: 'YOUR_API_ENDPOINT', method: 'POST', data: feedbackData, ... });
};
</script>
<style lang="scss" scoped>
.feedback-page {
  background-color: #f5f5f5;
  padding: 16px;
  box-sizing: border-box; // 确保内边距不会增加总宽度

  .form-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 12px;
    }

    .feedback-textarea {
      width: 100%;
      // 覆盖 wd-textarea 的一些默认样式，使其更贴合设计
      ::v-deep .wd-textarea__textarea {
        min-height: 100px; // 设定最小高度
      }
      ::v-deep .wd-textarea__word-limit {
        color: #999;
        font-size: 12px;
      }
    }

    .contact-input {
      // 覆盖 wd-input 的一些默认样式
      ::v-deep .wd-input__inner {
        padding: 8px 0; // 调整输入框内边距
      }
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .upload-tip {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .submit-button-container {
    padding-top: 10px; // 与上方表单拉开距离
    .wd-button {
      border-radius: 8px;
    }
  }
}
</style>
