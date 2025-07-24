<template>
  <view class="help-center-container">
    <view class="search-section">
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="搜索常见问题"
        @confirm="searchFAQ"
      />
      <wd-icon name="search" class="search-icon" @click="searchFAQ"></wd-icon>
    </view>

    <view class="faq-section">
      <view class="section-title">常见问题</view>
      <wd-collapse v-model="activeNames" accordion>
        <wd-collapse-item
          v-for="(category, index) in filteredFaqs"
          :key="index"
          :title="category.title"
          :name="category.name"
        >
          <view class="faq-list">
            <view
              v-for="(item, itemIndex) in category.items"
              :key="itemIndex"
              class="faq-item"
            >
              <view class="question">{{ item.question }}</view>
              <view class="answer">{{ item.answer }}</view>
            </view>
          </view>
        </wd-collapse-item>
      </wd-collapse>
    </view>

    <view class="contact-section">
      <view class="section-title">联系客服</view>
      <view class="contact-item" @click="callCustomerService">
        <text class="contact-label">客服热线</text>
        <text class="contact-value">{{ COMPANY_INFO.phone }}</text>
      </view>
      <view class="contact-item" @click="copyCustomerServiceEmail">
        <text class="contact-label">客服邮箱</text>
        <text class="contact-value">{{ COMPANY_INFO.email }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { COMPANY_INFO } from "@/constants";

const searchQuery = ref("");
const activeNames = ref([]); // 当前展开的面板名称
const faqs = ref([
  {
    title: "账号与安全",
    name: "account",
    items: [
      {
        question: "如何注册/登录账号？",
        answer: "您可以通过手机号或第三方平台（微信、QQ）进行注册和登录。",
      },
      {
        question: "忘记密码怎么办？",
        answer: "在登录页面点击“忘记密码”，通过手机验证码重置密码。",
      },
      {
        question: "如何修改个人资料？",
        answer: "在“我的”-“个人资料”中可以修改头像、昵称等信息。",
      },
    ],
  },
  {
    title: "订单与支付",
    name: "order",
    items: [
      {
        question: "如何查看订单状态？",
        answer: "在“我的”-“我的订单”中可以查看所有订单的详细状态。",
      },
      {
        question: "支持哪些支付方式？",
        answer: "我们支持微信支付、支付宝支付和银行卡支付。",
      },
      {
        question: "如何申请退款？",
        answer: "请在订单详情页提交退款申请，客服会在24小时内处理。",
      },
    ],
  },
  {
    title: "服务与预约",
    name: "service",
    items: [
      {
        question: "如何预约服务？",
        answer: "在服务详情页选择服务时间、技师后即可提交预约。",
      },
      {
        question: "可以取消或修改预约吗？",
        answer: "在预约开始前2小时，您可以在“我的预约”中取消或修改。",
      },
      {
        question: "服务过程中遇到问题怎么办？",
        answer: "请及时联系您的技师或拨打客服热线寻求帮助。",
      },
    ],
  },
  {
    title: "隐私与数据",
    name: "privacy",
    items: [
      {
        question: "我的个人信息安全吗？",
        answer: "我们严格遵守隐私政策，采用多重加密技术保护您的个人数据。",
      },
      {
        question: "如何管理我的数据权限？",
        answer: "您可以在“设置”-“隐私设置”中管理您的数据使用权限。",
      },
    ],
  },
  {
    title: "其他问题",
    name: "other",
    items: [
      {
        question: "如何提供反馈和建议？",
        answer: "您可以在“设置”-“帮助与反馈”中提交您的宝贵意见。",
      },
      {
        question: "如何联系人工客服？",
        answer: "您可以拨打客服热线或发送邮件至客服邮箱。",
      },
    ],
  },
]);

const filteredFaqs = computed(() => {
  if (!searchQuery.value) {
    return faqs.value;
  }
  const query = searchQuery.value.toLowerCase();
  return faqs.value
    .map((category) => {
      const filteredItems = category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query),
      );
      return { ...category, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);
});

const searchFAQ = () => {
  // 搜索逻辑已通过 computed 属性 filteredFaqs 实现，这里可以添加搜索后的其他操作，例如展开所有匹配的折叠项
  // 如果需要搜索后自动展开，可以遍历 filteredFaqs，将匹配到的 category.name 加入 activeNames
  activeNames.value = filteredFaqs.value.map((category) => category.name);
};

const callCustomerService = () => {
  uni.makePhoneCall({
    phoneNumber: "400-123-4567",
  });
};

const copyCustomerServiceEmail = () => {
  uni.setClipboardData({
    data: "support@example.com",
    success: function () {
      uni.showToast({
        title: "邮箱已复制",
        icon: "none",
      });
    },
  });
};
</script>

<style lang="scss" scoped>
.help-center-container {
  display: flex;
  flex-direction: column;
}

.search-section {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .search-input {
    flex: 1;
    height: 70rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f5f5f5;
    border-radius: 35rpx;
  }

  .search-icon {
    margin-left: 20rpx;
    font-family: iconfont;
    font-size: 40rpx;
    color: #999;
  }
}

.faq-section,
.contact-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #fff;
}

.section-title {
  padding: 30rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.faq-list {
  padding: 20rpx 0;
}

.faq-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .question {
    margin-bottom: 10rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }

  .answer {
    font-size: 28rpx;
    line-height: 1.6;
    color: #666;
  }
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .contact-label {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .contact-value {
    margin-right: 20rpx;
    font-size: 30rpx;
    color: #666;
  }
}
</style>
