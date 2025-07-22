<template>
  <view class="notifications-page">
    <scroll-view scroll-y class="scroll-view">
      <view class="notification-types">
        <view
          class="type-item"
          :class="{ active: activeType === 'all' }"
          @click="
            activeType = 'all';
            isBatchMode = false;
            selectedNotifications = [];
          "
        >
          <text>全部</text>
        </view>
        <view
          class="type-item"
          :class="{ active: activeType === 'system' }"
          @click="
            activeType = 'system';
            isBatchMode = false;
            selectedNotifications = [];
          "
        >
          <text>系统通知</text>
        </view>
        <view
          class="type-item"
          :class="{ active: activeType === 'interaction' }"
          @click="
            activeType = 'interaction';
            isBatchMode = false;
            selectedNotifications = [];
          "
        >
          <text>互动消息</text>
        </view>
      </view>

      <view class="action-buttons">
        <text class="action-btn" @click="markAllAsRead">全部已读</text>
        <text class="action-btn" @click="isBatchMode = !isBatchMode">{{
          isBatchMode ? "取消" : "批量管理"
        }}</text>
      </view>

      <wd-checkbox-group
        v-model="selectedNotificationIds"
        custom-class="notification-list-group"
      >
        <view
          v-for="item in filteredNotifications"
          :key="item.id"
          class="notification-item"
          :class="{ 'is-read': item.read }"
          @click="handleNotificationClick(item)"
        >
          <view v-if="isBatchMode" class="checkbox-wrapper" @click.stop="noop">
            <wd-checkbox :model-value="item.id" />
          </view>
          <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
          <view class="content">
            <view class="title">
              <text class="username">{{ item.username }}</text>
              <text class="action">{{ item.action }}</text>
            </view>
            <text class="message">{{ item.message }}</text>
            <text class="time">{{ formatTime(item.time) }}</text>
          </view>
          <view v-if="!item.read && !isBatchMode" class="unread"></view>
        </view>
      </wd-checkbox-group>

      <view v-if="filteredNotifications.length === 0" class="no-notifications">
        暂无通知
      </view>
    </scroll-view>
    <safe-area-footer>
      <view v-if="isBatchMode" class="batch-actions-footer">
        <view class="select-all" @click="toggleSelectAll">
          <wd-checkbox
            :model-value="isAllSelected"
            custom-class="select-all-checkbox"
            @change="noop"
          >
            <text>全选</text>
          </wd-checkbox>
        </view>
        <view class="batch-buttons">
          <text class="batch-btn delete-btn" @click="deleteSelected">删除</text>
          <text class="batch-btn clear-btn" @click="clearAllNotifications"
            >清空</text
          >
        </view>
      </view>
    </safe-area-footer>

    <!-- 引入 action-confirmation-modal 组件 -->
    <action-confirmation-modal
      v-model:show="showDeleteConfirmModal"
      @confirm="confirmDeleteSelected"
    >
      <template #modal-title>
        <text>确认删除</text>
      </template>
      <template #modal-description>
        <text>确定要删除这些通知吗？</text>
      </template>
    </action-confirmation-modal>

    <action-confirmation-modal
      v-model:show="showClearConfirmModal"
      @confirm="confirmClearAllNotifications"
    >
      <template #modal-title>
        <text>确认清空</text>
      </template>
      <template #modal-description>
        <text>您确定要清空所有通知吗？此操作不可恢复！</text>
      </template>
    </action-confirmation-modal>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// 通知类型
const activeType = ref("all");

// 模拟通知数据
const notifications = ref([
  // {
  //   id: 1,
  //   type: "system",
  //   username: "系统通知",
  //   avatar: "/static/logo.png",
  //   action: "",
  //   message: "您有一条新的系统消息，请及时查看",
  //   time: "2023-05-15 10:30",
  //   read: false,
  // },
  {
    id: 2,
    type: "interaction",
    username: "用户A",
    avatar: "/static/default_avator1.jpg",
    action: "点赞了您的动态",
    message: '您的动态"社区活动"获得了点赞',
    time: "2023-05-14 15:20",
    read: false,
  },
  {
    id: 3,
    type: "interaction",
    username: "用户B",
    avatar: "/static/default_avator2.jpg",
    action: "评论了您的动态",
    message: "评论内容: 这个活动很有意义",
    time: "2023-05-14 09:45",
    read: true,
  },
  {
    id: 4,
    type: "system",
    username: "系统通知",
    avatar: "/static/logo.png",
    action: "",
    message: "系统更新通知：新版本已发布，请及时更新",
    time: "2023-05-13 11:00",
    read: false,
  },
  {
    id: 5,
    type: "interaction",
    username: "用户C",
    avatar: "/static/default_avator3.jpg",
    action: "关注了您",
    message: "用户C关注了您的账号",
    time: "2023-05-12 18:00",
    read: false,
  },
]);

const selectedNotificationIds = ref([]);

// 批量管理模式
const isBatchMode = ref(false);

// 控制删除确认弹窗的显示
const showDeleteConfirmModal = ref(false);
// 控制清空确认弹窗的显示
const showClearConfirmModal = ref(false);

// 过滤通知
const filteredNotifications = computed(() => {
  if (activeType.value === "all") {
    return notifications.value;
  }
  return notifications.value.filter((item) => item.type === activeType.value);
});

// Watch for changes in `isBatchMode` and clear `selectedNotificationIds`
watch(isBatchMode, (newValue) => {
  if (!newValue) {
    selectedNotificationIds.value = [];
  }
});

// 是否全选
const isAllSelected = computed(() => {
  const currentFilteredIds = filteredNotifications.value.map((item) => item.id);
  return (
    currentFilteredIds.length > 0 &&
    currentFilteredIds.every((id) => selectedNotificationIds.value.includes(id))
  );
});

// 格式化时间
const formatTime = (time) => {
  // 这里可以添加更复杂的时间格式化逻辑
  return time;
};

// 处理通知点击
const handleNotificationClick = (item) => {
  if (isBatchMode.value) {
    // Manually toggle selection when in batch mode
    const index = selectedNotificationIds.value.indexOf(item.id);
    if (index > -1) {
      selectedNotificationIds.value.splice(index, 1);
    } else {
      selectedNotificationIds.value.push(item.id);
    }
    return;
  }
  // 标记为已读
  item.read = true;

  // 根据通知类型跳转到不同页面
  if (item.type === "system") {
    uni.navigateTo({
      url: "/pages/system-notification/system-notification?id=" + item.id,
    });
  } else {
    uni.navigateTo({
      url: "/pages/post-detail/post-detail?id=" + item.id,
    });
  }
};

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach((item) => {
    item.read = true;
  });
  uni.showToast({
    title: "全部已读",
    icon: "success",
    duration: 1000,
  });
};

// 全选/全不选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedNotificationIds.value = [];
  } else {
    selectedNotificationIds.value = filteredNotifications.value.map(
      (item) => item.id,
    );
  }
};

// 删除选中的通知
const deleteSelected = () => {
  const selectedIds = selectedNotificationIds.value;
  if (selectedIds.length === 0) {
    uni.showToast({
      title: "请选择要删除的通知",
      icon: "none",
      duration: 1500,
    });
    return;
  }
  showDeleteConfirmModal.value = true;
};

// 确认删除选中的通知
const confirmDeleteSelected = () => {
  const selectedIds = selectedNotificationIds.value;
  notifications.value = notifications.value.filter(
    (item) => !selectedIds.includes(item.id),
  );
  isBatchMode.value = false; // 删除后退出批量管理模式
  selectedNotificationIds.value = []; // 清空选中状态
  uni.showToast({
    title: "删除成功",
    icon: "success",
    duration: 1000,
  });
};

// 清空所有通知
const clearAllNotifications = () => {
  showClearConfirmModal.value = true;
};

// 确认清空所有通知
const confirmClearAllNotifications = () => {
  notifications.value = [];
  isBatchMode.value = false; // 清空后退出批量管理模式
  selectedNotificationIds.value = []; // 清空选中状态
  uni.showToast({
    title: "已清空",
    icon: "success",
    duration: 1000,
  });
};

function noop() {}
</script>

<style lang="scss" scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.notification-types {
  display: flex;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  .type-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;

    &.active {
      color: #2979ff;
      font-weight: bold;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 6rpx;
        background-color: #2979ff;
        border-radius: 3rpx;
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
  padding: 0 20rpx;

  .action-btn {
    font-size: 26rpx;
    color: #2979ff;
    margin-left: 30rpx;
    padding: 10rpx 0;
  }
}

.notification-list-group {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  position: relative;
  transition: background-color 0.3s ease;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    left: 20rpx;
    right: 20rpx;
    bottom: 0;
    height: 1rpx;
    background-color: #eee;
    transform: scaleY(0.5);
  }

  &.is-read {
    background-color: #f9f9f9; // 已读通知的背景色
    .content {
      .username,
      .action,
      .message,
      .time {
        color: #999; // 已读通知的文字颜色变浅
      }
    }
  }

  .checkbox-wrapper {
    width: 60rpx;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10rpx;
  }

  // Override wd-checkbox default styles for integration
  .wd-checkbox {
    // Adjust margin or other styles if needed
    margin: 0 !important;
  }

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;

      .username {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-right: 10rpx;
      }

      .action {
        font-size: 26rpx;
        color: #666;
      }
    }

    .message {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
      line-height: 1.4;
    }

    .time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .unread {
    width: 16rpx;
    height: 16rpx;
    background-color: #ff4d4f;
    border-radius: 50%;
    margin-left: 20rpx;
    flex-shrink: 0;
  }
}

.no-notifications {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-top: 20rpx;
}

.batch-actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .select-all {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    color: #333;

    .select-all-checkbox {
      margin-right: 10rpx; // Adjust spacing for the text "全选"
    }
  }

  .batch-buttons {
    display: flex;

    .batch-btn {
      padding: 16rpx 36rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      margin-left: 20rpx;
      text-align: center;
      min-width: 160rpx;

      &.delete-btn {
        background-color: #ff4d4f;
        color: #fff;
      }

      &.clear-btn {
        background-color: #f0f0f0;
        color: #333;
      }
    }
  }
}
</style>
