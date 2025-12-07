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
      <view class="btn-cancel" hover-class="btn-hover" @click="onCancel">{{ cancelText }}</view>
      <view class="btn-divider"></view>
      <view class="btn-confirm" hover-class="btn-hover" @click="onConfirm">{{ confirmText }}</view>
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
  width: 680rpx;
  border-radius: 24rpx;
}
</style>
<style lang="scss" scoped>
.action-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 48rpx 0;
  background: #fff;
}

.modal-title {
  font-family: PingFangSC-Medium;
  font-size: 34rpx;
  font-weight: 700;
  color: rgb(51 51 51);
  text-align: center;
}

.modal-description {
  padding: 32rpx 0;
  margin-bottom: 32rpx;
  font-size: 30rpx;
  font-weight: 400;
  color: rgb(127 127 127);
  text-align: justify;
  text-align-last: center;

  .link {
    color: $uni-color-active;
    text-decoration: underline;
  }
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  height: 113rpx;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 112rpx;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 112rpx;
  text-align: center;
  cursor: pointer;
}

.btn-cancel {
  color: #333;
}

.btn-confirm {
  font-weight: bold;
  color: $uni-color-active;
}

.btn-divider {
  width: 1px;
  height: 100%;
  background-color: #eee;
}

.btn-hover {
  background-color: #f5f5f5;
}
</style>
