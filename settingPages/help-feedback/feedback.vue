<template>
  <view class="container">
    <!-- 反馈内容 -->
    <view class="card">
      <view class="card-header">
        <view class="title-wrapper">
          <view class="decorate-line"></view>
          <text class="title">反馈内容</text>
          <text class="required">*</text>
        </view>
      </view>
      <view class="textarea-wrapper">
        <textarea
          v-model="feedbackContent"
          placeholder="请描述您遇到的问题、建议或意见，我们将尽快处理..."
          placeholder-class="placeholder"
          maxlength="200"
          class="content-textarea"
          :disable-default-padding="true"
        />
        <text class="word-count">{{ feedbackContent.length }}/200</text>
      </view>
    </view>

    <!-- 图片上传 -->
    <view class="card">
      <view class="card-header">
        <view class="title-wrapper">
          <view class="decorate-line"></view>
          <text class="title">上传图片</text>
          <text class="subtitle">（选填，最多3张）</text>
        </view>
      </view>
      <view class="upload-wrapper">
        <wd-upload
          v-model:file-list="feedbackImages"
          :limit="maxImages"
          :action="uploadAction"
          name="image"
          :header="uploadHeaders"
          :form-data="uploadFormData"
          image-mode="aspectFill"
          :auto-upload="true"
          @success="handleUploadSuccess"
          @fail="handleUploadFail"
          @remove="handleRemoveImage"
          @oversize="handleOversize"
        ></wd-upload>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="card">
      <view class="card-header">
        <view class="title-wrapper">
          <view class="decorate-line"></view>
          <text class="title">联系方式</text>
          <text class="subtitle">（选填）</text>
        </view>
      </view>
      <view class="input-wrapper">
        <input
          v-model="contactInfo"
          type="text"
          placeholder="留下您的手机号/邮箱，方便联系"
          placeholder-class="placeholder"
          class="contact-input"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="footer-area">
      <bottom-fixed-button size="large" :fixed="false" @click="submitFeedback"> 提交反馈 </bottom-fixed-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

// 反馈内容
const feedbackContent = ref("");
// 联系方式
const contactInfo = ref("");
// 上传的图片列表
const feedbackImages = ref([]);
const maxImages = 3;

// wd-upload 组件的上传地址
const uploadAction = ref("https://mockapi.eolink.com/zhTuw2P8c29bc981a741931bdd86eb04dc1e8fd64865cb5/upload");

// 上传接口相关的请求头
const uploadHeaders = ref({});

// 上传接口相关的额外表单数据
const uploadFormData = ref({
  scene: "feedback",
});

// 计算属性
const hasPendingUploads = computed(() => {
  return feedbackImages.value.some((file) => file.status === "uploading");
});

const hasFailedUploads = computed(() => {
  return feedbackImages.value.some((file) => file.status === "fail");
});

// WD-Upload 组件事件处理
const handleUploadSuccess = (event) => {
  console.log("图片上传成功:", event.file, event.fileList);
  uni.showToast({ title: "图片上传成功", icon: "success" });
};

const handleUploadFail = (event) => {
  console.error("图片上传失败:", event.error, event.file);
  uni.showToast({ title: event.error.errMsg || "图片上传失败", icon: "none" });
};

const handleRemoveImage = (event) => {
  console.log("图片被移除:", event.file);
  uni.showToast({ title: "图片已移除", icon: "none" });
};

const handleOversize = (event) => {
  console.warn("文件大小超过限制:", event.file);
  uni.showToast({
    title: `文件 ${event.file.name} 大小超过限制`,
    icon: "none",
  });
};

// 提交反馈
const submitFeedback = () => {
  if (feedbackContent.value.length < 5 || feedbackContent.value.length > 200) {
    uni.showToast({ title: "反馈内容字数需在5-200之间", icon: "none" });
    return;
  }

  if (hasPendingUploads.value) {
    uni.showToast({ title: "图片正在上传中，请稍候", icon: "none" });
    return;
  }
  if (hasFailedUploads.value) {
    uni.showToast({ title: "有图片上传失败，请删除或重新上传", icon: "none" });
    return;
  }

  uni.showLoading({ title: "提交中..." });

  // 模拟提交反馈请求
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: "反馈已提交，感谢您的宝贵意见！", icon: "success" });

    console.log("最终反馈内容:", feedbackContent.value);
    console.log("最终联系方式:", contactInfo.value);
    console.log(
      "最终反馈图片URLs:",
      feedbackImages.value.filter((file) => file.status === "success").map((file) => file.url),
    );

    // 提交成功后清空表单
    feedbackContent.value = "";
    contactInfo.value = "";
    feedbackImages.value = [];
  }, 1500);
};
</script>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 30rpx;
}

.card {
  padding: 30rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgb(0 0 0 / 2%);

  .card-header {
    margin-bottom: 24rpx;

    .title-wrapper {
      display: flex;
      align-items: center;

      .decorate-line {
        width: 8rpx;
        height: 28rpx;
        margin-right: 16rpx;
        background: #4c92fc;
        border-radius: 4rpx;
      }

      .title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .required {
        margin-left: 8rpx;
        font-size: 32rpx;
        color: #ff4d4f;
      }

      .subtitle {
        margin-left: 12rpx;
        font-size: 24rpx;
        font-weight: normal;
        color: #999;
      }
    }
  }
}

.textarea-wrapper {
  position: relative;
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 16rpx;

  .content-textarea {
    width: 100%;
    height: 240rpx;
    font-size: 28rpx;
    line-height: 1.5;
    color: #333;
  }

  .placeholder {
    color: #bbb;
  }

  .word-count {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #bbb;
    text-align: right;
  }
}

.input-wrapper {
  padding: 0 24rpx;
  background: #f9f9f9;
  border-radius: 16rpx;

  .contact-input {
    width: 100%;
    height: 88rpx;
    font-size: 28rpx;
    color: #333;
  }

  .placeholder {
    color: #bbb;
  }
}

.upload-wrapper {
  padding-top: 10rpx;
}

.footer-area {
  margin-top: 60rpx;

  .submit-btn {
    height: 96rpx;
    font-size: 34rpx;
    font-weight: 600;
    line-height: 96rpx;
    color: #fff;
    background: $uni-bg-linear-gradient;
    border-radius: 48rpx;
    box-shadow: 0 12rpx 24rpx rgb(44 117 234 / 20%);

    &::after {
      border: none;
    }
  }

  .submit-btn-hover {
    opacity: 0.9;
    transform: scale(0.99);
  }
}
</style>
