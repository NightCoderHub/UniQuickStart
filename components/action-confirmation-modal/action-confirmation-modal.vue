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
  width: 600rpx;
  border-radius: 32rpx;
}
</style>
<style lang="scss" scoped>
.action-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 52rpx 48rpx;
  background: #fff;
}

.modal-title {
  margin-bottom: 16rpx;
  font-size: 32rpx;
  color: #000;
  text-align: center;
}

.modal-description {
  width: 500rpx;
  margin-right: auto;
  margin-left: auto;
  font-size: 28rpx;
  color: #333;
  text-align: justify;
  text-align-last: center;

  .link {
    color: #007aff;
    text-decoration: underline;
  }
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  border-top: 1rpx solid #eee;
}

.btn-cancel,
.btn-confirm {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 28rpx;
  cursor: pointer;
}

.btn-cancel {
  color: #333;
}

.btn-confirm {
  font-weight: bold;
  color: #007aff;
}

.btn-divider {
  width: 1px;
  height: 100%;
  background-color: #ebedf0;
}
</style>
