<template>
  <view class="container">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="title">客服中心</view>
      <view class="subtitle">为您提供全方位的服务支持</view>
    </view>

    <!-- 联系方式卡片 -->
    <view class="contact-card">
      <view class="contact-item" @click="handleOnlineService">
        <view class="icon-wrapper online">
          <text class="iconfont icon-kefu"></text>
        </view>
        <view class="info">
          <text class="label">在线客服</text>
          <text class="desc">即时沟通，快速解决</text>
        </view>
        <text class="arrow iconfont icon-arrow-right"></text>
      </view>
      <view class="divider"></view>
      <view class="contact-item" @click="handlePhoneCall">
        <view class="icon-wrapper phone">
          <text class="iconfont icon-shouji"></text>
        </view>
        <view class="info">
          <text class="label">电话客服</text>
          <text class="desc">{{ COMPANY_INFO.phone }}</text>
        </view>
        <text class="arrow iconfont icon-arrow-right"></text>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="faq-section">
      <view class="section-title">常见问题</view>
      <view class="faq-list">
        <view v-for="(item, index) in faqList" :key="index" class="faq-item" @click="toggleFaq(index)">
          <view class="question-row">
            <text class="question">{{ item.question }}</text>
            <text class="iconfont icon-icon-arrow-down spec-arrow" :class="{ rotate: item.expanded }"></text>
          </view>
          <view v-if="item.expanded" class="answer">
            {{ item.answer }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部服务时间 -->
    <view class="footer">
      <text>服务时间：周一至周日 9:00-21:00</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { COMPANY_INFO } from "@/constants";

const faqList = ref([
  {
    question: "如何预约师傅上门？",
    answer: "您可以在首页选择所需服务类型，浏览师傅列表，点击心仪师傅的“去预约”按钮，选择合适的时间填写地址即可完成预约。",
    expanded: false,
  },
  {
    question: "服务收费标准是怎样的？",
    answer: "基础服务费在预约页面有明确标注。如有配件更换或特殊情况，师傅会上门检测后提供详细报价，您确认后才会进行维修。",
    expanded: false,
  },
  {
    question: "预约后可以取消吗？",
    answer: "在师傅出发前，您可以随时在订单详情页免费取消。若师傅已出发或已到达，可能会收取一定的上门费。",
    expanded: false,
  },
  {
    question: "如何申请售后/投诉？",
    answer: "服务完成后，如果你对服务不满意，可以在订单页点击“售后/投诉”，或直接联系在线客服进行处理。",
    expanded: false,
  },
]);

const toggleFaq = (index) => {
  faqList.value[index].expanded = !faqList.value[index].expanded;
};

const handleOnlineService = () => {
  // 模拟跳转在线客服或打开聊天窗口
  uni.showToast({
    title: "功能开发中...",
    icon: "none",
  });
};

const handlePhoneCall = () => {
  uni.makePhoneCall({
    phoneNumber: COMPANY_INFO.phone,
  });
};
</script>

<style lang="scss" scoped>
.container {
  max-height: 100vh;
  padding-bottom: 40rpx;
  background-color: #f5f7fa;
}

.header-bg {
  box-sizing: border-box;
  height: 300rpx;
  padding: 60rpx 40rpx;
  color: #fff;
  background: $uni-bg-linear-gradient;

  .title {
    margin-bottom: 16rpx;
    font-size: 40rpx;
    font-weight: bold;
  }

  .subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.contact-card {
  padding: 0 30rpx;
  margin: -100rpx 30rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgb(0 0 0 / 5%);

  .contact-item {
    display: flex;
    align-items: center;
    padding: 40rpx 0;

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 88rpx;
      height: 88rpx;
      margin-right: 24rpx;
      border-radius: 50%;

      &.online {
        color: #4c92fc;
        background: rgb(76 146 252 / 10%);
      }

      &.phone {
        color: #f90;
        background: rgb(255 153 0 / 10%);
      }

      .iconfont {
        font-size: 40rpx;
      }
    }

    .info {
      display: flex;
      flex: 1;
      flex-direction: column;

      .label {
        margin-bottom: 8rpx;
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }

      .desc {
        font-size: 24rpx;
        color: #999;
      }
    }

    .arrow {
      font-size: 32rpx;
      color: #ccc;
    }
  }

  .divider {
    height: 1rpx;
    background: #f0f0f0;
  }
}

.faq-section {
  padding: 30rpx;
  margin: 0 30rpx;
  background: #fff;
  border-radius: 16rpx;

  .section-title {
    padding-left: 10rpx;
    margin-bottom: 20rpx;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 1;
    color: #333;
    border-left: 8rpx solid #4c92fc;
  }

  .faq-item {
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .question-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx 0;

      .question {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }

      .arrow {
        font-size: 24rpx;
        color: #ccc;
        transition: transform 0.3s;

        &.rotate {
          transform: rotate(180deg);
        }
      }
    }

    .answer {
      padding: 0 0 30rpx;
      font-size: 26rpx;
      line-height: 1.6;
      color: #666;
      background: #fff;
    }
  }
}

.footer {
  margin-top: 60rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}
</style>
