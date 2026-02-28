<template>
  <action-confirmation-modal
    v-model:show="showPrivacyModal"
    cancel-text="暂不同意"
    confirm-text="同意并继续"
    @cancel="handlePrivacyDisagree"
    @confirm="handlePrivacyAgree"
  >
    <template #modal-title>
      <text>隐私政策和用户协议</text>
    </template>
    <template #modal-description>
      我们非常重视您的个人信息和隐私保护，为了更好的保障您的个人权益，在您使用我们的产品前，请务必审慎阅读
      <text class="highlight-link" @click="openPolicy('privacy')">《隐私政策》</text>
      和
      <text class="highlight-link" @click="openPolicy('agreement')">《用户协议》</text
      >内的所有条款，同意并接受全部条款后即可开始使用我们的产品和服务。
    </template>
  </action-confirmation-modal>

  <action-confirmation-modal
    v-model:show="showSecondModal"
    cancel-text="继续浏览"
    confirm-text="查看协议"
    @cancel="handleSecondDisagree"
    @confirm="handleSecondAgree"
  >
    <template #modal-title>
      <text>同意隐私政策才能体验全部</text>
    </template>
    <template #modal-description>
      我们将充分尊重并保护您的隐私，关于我们需要收集、处理的必要信息可查看<text
        class="highlight-link"
        @click="openPolicy('privacy')"
        >《用户隐私政策》</text
      >。若不同意隐私政策，我们将无法正常提供 APP
      购买、客服、售后等服务。如您不同意，我们将提供浏览模式，浏览模式仅支持浏览，除此之外的附加功能将受限，当您触发受限的功能时，我们会以弹窗的形式进行提醒。浏览模式下，我们仅需请求联网权限、
      APP 版本渠道信息，不会收集、存储、共享您的任何个人信息。若您需要使用全部功能，请您点击同意并继续。
    </template>
  </action-confirmation-modal>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePrivacyStore } from "@/stores/modules/privacy.js";

// 定义响应式数据
const showPrivacyModal = ref(false);
const showSecondModal = ref(false);
const privacyStore = usePrivacyStore();

// 页面加载时检查隐私协议状态
onMounted(() => {
  privacyStore.refreshFromStorage();
  const agreed = privacyStore.isAgreed;
  const browsing = privacyStore.isBrowsing;
  if (!agreed && !browsing) {
    showPrivacyModal.value = true;
  }
});

const handlePrivacyDisagree = () => {
  showSecondModal.value = true;
};

const handlePrivacyAgree = () => {
  privacyStore.setAgreed(true);
  privacyStore.setBrowsingMode(false);
  uni.reLaunch({
    url: "/pages/index/index",
  });
};

const handleSecondDisagree = () => {
  // 进入浏览模式逻辑
  privacyStore.setBrowsingMode(true);
  uni.reLaunch({
    url: "/pages/index/index",
  });
};

const handleSecondAgree = () => {
  showPrivacyModal.value = true;
};

const openPolicy = (type) => {
  const urls = {
    privacy: "/settingPages/legal/privacy-policy",
    agreement: "/settingPages/legal/user-agreement",
  };
  uni.navigateTo({
    url: urls[type],
    fail: (err) => {
      console.error("跳转协议页面失败：", err);
      uni.showToast({
        title: "无法打开协议页面，请稍后再试",
        icon: "none",
      });
    },
  });
};
</script>

<style scoped lang="scss">
.highlight-link {
  color: #2563eb;
}
</style>
