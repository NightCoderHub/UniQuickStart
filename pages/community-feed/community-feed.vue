<template>
  <view class="community-feed">
    <!-- 顶部广告区域 -->
    <view class="header-ad">
      <view class="ad-content">
        <view class="ad-text">
          <text class="ad-title">城央阅景</text>
          <text class="ad-subtitle">低密住区</text>
          <text class="ad-description">CHENG YANG YUE JING</text>
          <text class="ad-description">DI MI ZHU QU</text>
          <text class="ad-area">建面约125-175㎡</text>
          <text class="ad-type">一梯一户小高层</text>
        </view>
        <view class="ad-actions">
          <wd-icon name="more-horizontal" size="24px" color="#fff"></wd-icon>
          <wd-icon name="target" size="24px" color="#fff"></wd-icon>
        </view>
      </view>
      <view class="ad-button">
        <text class="button-text">11月25日正式开售 ▶</text>
      </view>
      <view class="ad-decoration">
        <!-- 装饰性图案 -->
      </view>
    </view>

    <!-- 置顶标签 -->
    <view class="pinned-banner">
      <text class="pinned-text">置顶</text>
    </view>

    <!-- 动态列表 -->
    <scroll-view class="feed-scroll" scroll-y @scrolltolower="loadMore">
      <view v-for="post in posts" :key="post.id" class="feed-item">
        <view class="post-card">
          <!-- 用户信息 -->
          <view class="user-info">
            <image src="/static/default_avator.png" class="user-avatar"></image>
            <view class="user-details">
              <view class="user-header">
                <text class="username">{{ post.username }}</text>
                <wd-tag
                  v-for="tag in post.tags"
                  :key="tag.text"
                  :type="tag.type"
                  size="mini"
                  class="post-tag"
                >
                  {{ tag.text }}
                </wd-tag>
              </view>
            </view>
            <wd-button
              type="success"
              size="small"
              class="call-btn"
              @click="callUser(post)"
            >
              电话
            </wd-button>
          </view>

          <!-- 帖子内容 -->
          <view class="post-content">
            <text class="post-text">{{ post.content }}</text>
          </view>

          <!-- 图片网格 -->
          <view v-if="post.images && post.images.length > 0" class="image-grid">
            <image
              v-for="(image, index) in post.images"
              :key="index"
              :src="image"
              class="post-image"
              mode="aspectFill"
              @click="previewImage(post.images, index)"
            ></image>
          </view>

          <!-- 互动数据 -->
          <view class="post-stats">
            <view class="stat-item" @click="likePost(post)">
              <wd-icon
                name="thumb-up"
                size="16px"
                :color="post.isLiked ? '#52c41a' : '#999'"
              ></wd-icon>
              <text class="stat-text" :class="{ liked: post.isLiked }">{{
                post.likes
              }}</text>
            </view>
            <view class="stat-item" @click="showComments(post)">
              <wd-icon name="chat" size="16px" color="#999"></wd-icon>
              <text class="stat-text">{{ post.comments }}</text>
            </view>
          </view>

          <!-- 位置和时间信息 -->
          <view class="post-meta">
            <view class="location-info">
              <wd-icon name="location" size="14px" color="#999"></wd-icon>
              <text class="meta-text">{{ post.location }}</text>
              <text class="meta-text">距离≈{{ post.distance }}</text>
            </view>
            <view class="time-info">
              <text class="meta-text">{{ post.views }}浏览</text>
              <text class="meta-text">{{ post.date }}</text>
              <text class="meta-text">{{ post.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 右侧浮动菜单 -->
    <view v-show="showFloatingMenu" class="floating-menu">
      <view class="menu-item" @click="applyAd">
        <text class="menu-text">申请广告位</text>
      </view>
      <view class="menu-item" @click="myPosts">
        <text class="menu-text">我的动态</text>
      </view>
      <view class="menu-item" @click="publishPost">
        <text class="menu-text">发布动态</text>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="fab-container">
      <view class="fab-button" @click="toggleFloatingMenu">
        <wd-icon name="add" size="24px" color="#fff"></wd-icon>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view
        class="nav-item"
        :class="{ active: activeTab === 'home' }"
        @click="switchTab('home')"
      >
        <wd-icon
          name="home"
          size="24px"
          :color="activeTab === 'home' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'home' }"
          >首页</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'expert' }"
        @click="switchTab('expert')"
      >
        <wd-icon
          name="user"
          size="24px"
          :color="activeTab === 'expert' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'expert' }"
          >专家</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'nearby' }"
        @click="switchTab('nearby')"
      >
        <wd-icon
          name="location"
          size="24px"
          :color="activeTab === 'nearby' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'nearby' }"
          >附近</text
        >
      </view>
      <view
        class="nav-item"
        :class="{ active: activeTab === 'profile' }"
        @click="switchTab('profile')"
      >
        <wd-icon
          name="user-circle"
          size="24px"
          :color="activeTab === 'profile' ? '#52c41a' : '#999'"
        ></wd-icon>
        <text class="nav-text" :class="{ active: activeTab === 'profile' }"
          >我的</text
        >
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: "nearby",
      showFloatingMenu: false,

      posts: [
        {
          id: 1,
          username: "房东阿祖",
          avatar: "/static/user1.png",
          tags: [
            { text: "#房屋租赁", type: "success" },
            { text: "最新", type: "warning" },
          ],
          content:
            "健身房楼上\n三室一厅领包入住\n不喜欢别人霸占着器械玩手机\n全文",
          images: [
            "/static/room1.jpg",
            "/static/room2.jpg",
            "/static/room3.jpg",
          ],
          likes: 303,
          comments: 72,
          isLiked: false,
          location: "铜仁市碧江区河西街道花果山中路8号",
          distance: "1.9km",
          views: 3251,
          date: "2025年6月15日",
          time: "23:56",
        },
        {
          id: 2,
          username: "苟斗阿甘",
          avatar: "/static/user2.png",
          tags: [{ text: "#寻物启事", type: "primary" }],
          content: "寻狗狗，在金滩附近丢失，谢谢好心人",
          images: ["/static/dog1.jpg", "/static/dog2.jpg", "/static/dog3.jpg"],
          likes: 124,
          comments: 33,
          isLiked: false,
          location: "铜仁市碧江区南长城路鞋区a2栋金滩综合批发城",
          distance: "1.2km",
          views: 1245,
          date: "2025年6月14日",
          time: "12:35",
        },
      ],
    };
  },

  methods: {
    // 切换浮动菜单
    toggleFloatingMenu() {
      this.showFloatingMenu = !this.showFloatingMenu;
    },

    // 申请广告位
    applyAd() {
      console.log("申请广告位");
      this.showFloatingMenu = false;
    },

    // 我的动态
    myPosts() {
      console.log("我的动态");
      this.showFloatingMenu = false;
      uni.navigateTo({
        url: "/pages/my-posts/my-posts",
      });
    },

    // 发布动态
    publishPost() {
      console.log("发布动态");
      this.showFloatingMenu = false;
      uni.navigateTo({
        url: "/pages/publish-post/publish-post",
      });
    },

    // 点赞
    likePost(post) {
      post.isLiked = !post.isLiked;
      if (post.isLiked) {
        post.likes++;
      } else {
        post.likes--;
      }
    },

    // 显示评论
    showComments(post) {
      console.log("显示评论", post.id);
      uni.navigateTo({
        url: `/pages/post-detail/post-detail?postId=${post.id}`,
      });
    },

    // 预览图片
    previewImage(images, current) {
      uni.previewImage({
        urls: images,
        current: current,
      });
    },

    // 拨打电话
    callUser(post) {
      console.log("拨打电话给", post.username);
      uni.showActionSheet({
        itemList: ["拨打电话", "发送消息"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 拨打电话逻辑
            uni.makePhoneCall({
              phoneNumber: "13800138000",
            });
          } else if (res.tapIndex === 1) {
            // 发送消息逻辑
            console.log("发送消息");
          }
        },
      });
    },

    // 加载更多
    loadMore() {
      console.log("加载更多数据");
      // 模拟加载更多数据
    },

    // 切换底部标签
    switchTab(tab) {
      this.activeTab = tab;

      switch (tab) {
        case "home":
          uni.switchTab({
            url: "/pages/index/index",
          });
          break;
        case "expert":
          uni.switchTab({
            url: "/pages/technician-list/technician-list",
          });
          break;
        case "nearby":
          // 当前页面
          break;
        case "profile":
          uni.switchTab({
            url: "/pages/profile/profile",
          });
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.community-feed {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部广告区域 */
.header-ad {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  padding: 20px 16px;
  position: relative;
  overflow: hidden;

  .ad-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .ad-text {
      color: #fff;

      .ad-title {
        font-size: 24px;
        font-weight: bold;
        display: block;
        margin-bottom: 4px;
      }

      .ad-subtitle {
        font-size: 20px;
        font-weight: bold;
        display: block;
        margin-bottom: 8px;
      }

      .ad-description {
        font-size: 12px;
        opacity: 0.8;
        display: block;
        margin-bottom: 2px;
      }

      .ad-area {
        font-size: 14px;
        display: block;
        margin-top: 8px;
      }

      .ad-type {
        font-size: 12px;
        opacity: 0.9;
        display: block;
      }
    }

    .ad-actions {
      display: flex;
      gap: 12px;
    }
  }

  .ad-button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    padding: 8px 12px;
    align-self: flex-start;

    .button-text {
      color: #fff;
      font-size: 12px;
    }
  }

  .ad-decoration {
    position: absolute;
    right: -20px;
    top: 20px;
    width: 120px;
    height: 120px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;

    &::before {
      content: "";
      position: absolute;
      right: 20px;
      top: 20px;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  }
}

/* 置顶标签 */
.pinned-banner {
  background: #faad14;
  padding: 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    border-left: 20px solid #faad14;
    border-top: 15px solid #faad14;
    border-right: 15px solid transparent;
    border-bottom: 15px solid transparent;
  }

  .pinned-text {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    padding: 6px 12px 6px 24px;
    display: block;
  }
}

/* 动态列表 */
.feed-scroll {
  flex: 1;
  padding: 0 16px 100px;
}

.feed-item {
  margin-bottom: 12px;

  .post-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;

    .user-info {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;

      .user-avatar {
        margin-right: 12px;
        width: 76rpx;
        height: 76rpx;
      }

      .user-details {
        flex: 1;

        .user-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .username {
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }

          .post-tag {
            font-size: 10px;
          }
        }
      }

      .call-btn {
        border-radius: 16px;
        padding: 0 16px;
      }
    }

    .post-content {
      margin-bottom: 12px;

      .post-text {
        color: #333;
        font-size: 15px;
        line-height: 1.5;
        white-space: pre-line;
      }
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      margin-bottom: 12px;

      .post-image {
        width: 100%;
        height: 80px;
        border-radius: 4px;
      }
    }

    .post-stats {
      display: flex;
      gap: 24px;
      margin-bottom: 12px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .stat-text {
          font-size: 14px;
          color: #999;

          &.liked {
            color: #52c41a;
          }
        }
      }
    }

    .post-meta {
      .location-info {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;

        .meta-text {
          font-size: 12px;
          color: #999;
        }
      }

      .time-info {
        display: flex;
        gap: 8px;

        .meta-text {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}

/* 浮动菜单 */
.floating-menu {
  position: fixed;
  right: 16px;
  bottom: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 999;

  .menu-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .menu-text {
      font-size: 14px;
      color: #333;
      white-space: nowrap;
    }
  }
}

/* 发布按钮 */
.fab-container {
  position: fixed;
  right: 16px;
  bottom: 120px;
  z-index: 998;

  .fab-button {
    width: 56px;
    height: 56px;
    background: #faad14;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
  }
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .nav-text {
      font-size: 12px;
      color: #999;

      &.active {
        color: #52c41a;
      }
    }
  }
}
</style>
