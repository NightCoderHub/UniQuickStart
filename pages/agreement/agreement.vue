<template>
  <view class="agreement-container">
    <!-- <uni-nav-bar fixed title="服务合同协议" status-bar left-icon="left" @clickLeft="goBack"></uni-nav-bar> -->

    <scroll-view scroll-y class="agreement-content">
      <view class="content-padding">
        <view class="section-title">欢迎使用我们的服务！</view>
        <text class="paragraph">
          在您使用我们的服务之前，请务必仔细阅读本《服务合同协议》（以下简称“本协议”）。本协议构成您与[您的公司名称/平台名称]（以下简称“我们”或“平台”）之间具有法律约束力的协议。通过访问或使用我们的服务，即表示您已阅读、理解并同意遵守本协议的所有条款和条件。
        </text>

        <view class="section-title">1. 服务范围</view>
        <text class="paragraph">
          1.1
          本平台致力于为您提供[具体服务内容，例如：家政服务、维修服务、跑腿服务等]的在线预约、信息发布与撮合服务。
          1.2
          服务的具体内容、价格、服务时间、服务人员（技师）等信息，将根据您在平台上的选择和订单确认页面显示为准。
        </text>

        <view class="section-title">2. 用户权利与义务</view>
        <text class="paragraph">
          2.1 **权利：**
          您有权根据平台规则选择服务、对服务进行评价、享受平台提供的客户服务等。
          2.2 **义务：** \n(a) 您应提供真实、准确、完整的个人信息和需求信息。
          \n(b) 您应按照订单约定及时支付服务费用。 \n(c)
          您应尊重服务人员，提供安全、合适的服务环境。 \n(d)
          您不得利用本平台从事任何违法、侵权或损害平台及第三方利益的活动。
        </text>

        <view class="section-title">3. 服务人员（技师）责任</view>
        <text class="paragraph">
          3.1
          平台对注册服务人员进行资质审核，但不对服务人员的个体行为承担无限连带责任。
          3.2 服务人员应按照平台标准和您的订单要求提供专业、优质的服务。 3.3
          若因服务人员原因导致服务未能完成或服务质量问题，平台将协助您与服务人员协商解决，并根据平台规则进行相应处理。
        </text>

        <view class="section-title">4. 费用与支付</view>
        <text class="paragraph">
          4.1 服务的具体费用将在您提交订单前明确展示。 4.2
          您可以通过平台支持的支付方式进行线上支付。所有交易均以人民币结算。 4.3
          除非本协议另有规定，已支付的服务费用通常不予退还，具体退款政策以平台退款规则为准。
        </text>

        <view class="section-title">5. 隐私保护</view>
        <text class="paragraph">
          5.1
          我们非常重视您的个人信息保护。我们将根据相关法律法规和《隐私政策》的规定，收集、使用、存储和保护您的个人信息。
          5.2
          未经您的同意，我们不会向任何第三方披露您的个人身份信息，除非法律另有规定。
        </text>

        <view class="section-title">6. 免责声明</view>
        <text class="paragraph">
          6.1
          本平台仅提供信息撮合服务，不对服务人员与用户之间直接发生的纠纷承担直接责任，但会积极协助双方解决。
          6.2
          因不可抗力（如自然灾害、政府行为、网络故障等）导致的服务中断或延迟，本平台不承担责任。
        </text>

        <view class="section-title">7. 协议的变更与终止</view>
        <text class="paragraph">
          7.1
          我们保留在必要时修改本协议的权利。修改后的协议将在平台公布，并自公布之日起生效。
          7.2 若您不接受修改后的协议，请立即停止使用我们的服务。 7.3
          您有权通过注销账户的方式终止本协议。
        </text>

        <view class="section-title">8. 法律适用与争议解决</view>
        <text class="paragraph">
          8.1
          本协议的订立、效力、履行、解释及争议的解决均适用中华人民共和国法律。
          8.2
          因本协议引起的或与本协议有关的争议，双方应首先通过友好协商解决；协商不成的，任何一方均有权向[您的公司注册地]有管辖权的人民法院提起诉讼。
        </text>

        <view class="section-title">9. 其他</view>
        <text class="paragraph">
          9.1 本协议的最终解释权归[您的公司名称/平台名称]所有。 9.2
          如果本协议中的任何条款被法院或其他有管辖权的机构裁定为无效，该无效条款不影响本协议其他条款的效力。
        </text>

        <view class="section-title">联系我们</view>
        <text class="paragraph">
          如果您对本协议有任何疑问，请通过以下方式联系我们：\n客服电话：[您的客服电话]\n电子邮箱：[您的客服邮箱]
        </text>

        <view class="paragraph footer-text">
          感谢您阅读本协议。请您在确认接受本协议条款后再继续使用我们的服务。
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
// 返回上一页
// const goBack = () => {
// 	uni.navigateBack({
// 		delta: 1 // 返回上一级页面
// 	});
// };

// 模拟用户点击同意并继续（如果底部有确认按钮）
// const agreeAndContinue = () => {
// 	// 这里可以添加逻辑，例如标记用户已同意
// 	uni.showToast({
// 		title: '您已同意协议',
// 		icon: 'success',
// 		duration: 1500
// 	});
// 	// 返回上一个页面，或跳转到其他页面
// 	uni.navigateBack({
// 		delta: 1
// 	});
// };
</script>

<style lang="scss" scoped>
.agreement-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8; // 背景色
}

/* uni-nav-bar 样式（如果使用 uni-ui 的 nav-bar） */
// :deep(.uni-navbar__content) {
// 	background-color: #fff !important;
// 	// border-bottom: 1px solid #f0f0f0;
// }
// :deep(.uni-navbar__header-btns) {
// 	color: #333 !important;
// }
// :deep(.uni-navbar-btn-text) {
// 	color: #333 !important;
// }
// :deep(.uni-nav-bar-text) {
// 	color: #333 !important;
// }

.agreement-content {
  // padding: 24rpx;
  box-sizing: border-box;
  flex: 1; /* 占据剩余空间，使其可滚动 */
  // margin-top: var(--status-bar-height); /* 适应顶部状态栏 */
  // margin-top: 44px; /* uni-nav-bar 的高度 */
  padding-bottom: constant(safe-area-inset-bottom); /* 适配底部安全区 */
  padding-bottom: env(safe-area-inset-bottom); /* 适配底部安全区 */
  background-color: #fff;
}

.content-padding {
  padding: 32rpx;
}

.section-title {
  margin-top: 40rpx;
  margin-bottom: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  line-height: 1.5;
  color: #333;
}

.paragraph {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap; /* 保留文本中的换行符 */
}

.footer-text {
  margin-top: 40rpx;
  color: #999;
  text-align: center;
}

.bottom-bar {
  position: sticky; /* 或者 fixed，根据需求选择 */
  bottom: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(
    24rpx + constant(safe-area-inset-bottom)
  ); /* 适配底部安全区 */

  padding-bottom: calc(
    24rpx + env(safe-area-inset-bottom)
  ); /* 适配底部安全区 */

  background-color: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
