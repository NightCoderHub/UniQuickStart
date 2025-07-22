<template>
  <wd-popup
    v-model="show"
    custom-class="action-modal-wrapper"
    position="center"
    :mask-closable="false"
    :close-on-click-modal="false"
  >
    <view class="action-modal-content">
      <view class="modal-title">
        <slot name="modal-title"> 请确认您的操作 </slot>
      </view>

      <view class="modal-description">
        <slot name="modal-description"> 您确定要执行此操作吗？ </slot>
      </view>
    </view>

    <view class="modal-actions">
      <view class="btn-cancel" @click="onCancel">{{ cancelText }}</view>
      <view class="btn-divider"></view>
      <view class="btn-confirm" @click="onConfirm">{{ confirmText }}</view>
    </view>
  </wd-popup>
</template>

<script setup>
defineOptions({
  options: {
    styleIsolation: "shared",
  },
});
// 1. 定义 v-model
// defineModel 会自动处理 show prop 和 update:show 事件
const show = defineModel("show", { type: Boolean, default: false });

// 2. 定义普通 props
defineProps({
  cancelText: {
    type: String,
    default: "取消",
  },
  confirmText: {
    type: String,
    default: "确认",
  },
});

// 3. 定义 emits (除了 v-model 相关的 update:show，还可以定义其他自定义事件)
const emit = defineEmits(["cancel", "confirm"]);

// 4. 定义方法
const onCancel = () => {
  show.value = false; // 关闭弹窗
  emit("cancel");
};

const onConfirm = () => {
  show.value = false; // 关闭弹窗
  emit("confirm");
};
</script>

<style>
:deep(.action-modal-wrapper) {
  border-radius: 32rpx;
  width: 600rpx;
}
</style>
<style lang="scss" scoped>
.action-modal-content {
  padding: 52rpx 48rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-title {
  font-family: PingFangSC-Medium;
  font-size: 32rpx;
  margin-bottom: 16rpx;
  color: #000;
  text-align: center;
}

.modal-description {
  width: 500rpx;
  text-align: justify;
  text-align-last: center;
  font-size: 28rpx;
  color: #333;
  margin-left: auto;
  margin-right: auto;

  .link {
    color: #007aff;
    text-decoration: underline;
  }
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1rpx solid #eee;
  height: 100rpx;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  height: 100%;
  cursor: pointer;
}

.btn-cancel {
  color: #333;
}

.btn-confirm {
  color: #007aff;
  font-weight: bold;
}

.btn-divider {
  width: 1px;
  height: 100%;
  background-color: #ebedf0;
}
</style>
