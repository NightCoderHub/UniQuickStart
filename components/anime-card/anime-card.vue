<template>
  <view class="anime-card">
    <view class="card-image">
      <lazy-image
        :src="anime.images.jpg.image_url"
        mode="aspectFill"
      ></lazy-image>
    </view>
    <view class="card-content">
      <view class="title-section">
        <text class="anime-title">{{
          anime.title_english || anime.title
        }}</text>
        <text v-if="anime.title_japanese" class="anime-title-jp">{{
          anime.title_japanese
        }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">类型:</text>
        <text class="info-value">{{ anime.type || "N/A" }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">评分:</text>
        <text class="info-value score">{{ anime.score || "N/A" }} ⭐</text>
      </view>

      <view class="info-row">
        <text class="info-label">集数:</text>
        <text class="info-value">{{ anime.episodes || "N/A" }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">上映:</text>
        <text class="info-value">{{ anime.aired.string || "N/A" }}</text>
      </view>

      <view class="info-row genres-row">
        <text class="info-label">流派:</text>
        <view class="genres-tags">
          <text
            v-for="(genre, index) in anime.genres"
            :key="index"
            class="genre-tag"
          >
            {{ genre.name }}
          </text>
          <text v-if="anime.genres.length === 0" class="info-value">N/A</text>
        </view>
      </view>

      <view class="synopsis-section">
        <text class="info-label">概要:</text>
        <text class="synopsis-text">{{ truncatedSynopsis }}</text>
        <text
          v-if="showExpandButton"
          class="expand-btn"
          @click="toggleSynopsis"
        >
          {{ isExpanded ? "收起" : "展开" }}
        </text>
      </view>

      <view class="card-actions">
        <button class="action-button" @click="goToDetails">查看详情</button>
        <button
          v-if="anime.trailer && anime.trailer.youtube_id"
          class="action-button"
          @click="playTrailer"
        >
          播放预告
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  anime: {
    type: Object,
    required: true,
    default: () => ({
      mal_id: 0,
      url: "",
      images: {
        jpg: { image_url: "", small_image_url: "", large_image_url: "" },
      },
      trailer: { youtube_id: "", url: "", embed_url: "", images: {} },
      approved: true,
      titles: [],
      title: "",
      title_english: "",
      title_japanese: "",
      title_synonyms: [],
      type: "",
      source: "",
      episodes: null,
      status: "",
      airing: false,
      aired: { from: "", to: "", prop: { from: {}, to: {} }, string: "" },
      duration: "",
      rating: "",
      score: null,
      scored_by: null,
      rank: null,
      popularity: null,
      members: null,
      favorites: null,
      synopsis: "",
      background: "",
      season: null,
      year: null,
      broadcast: {},
      producers: [],
      licensors: [],
      studios: [],
      genres: [],
      explicit_genres: [],
      themes: [],
      demographics: [],
    }),
  },
});

const isExpanded = ref(false);
const synopsisLimit = 150; // 概要文本的限制长度

const truncatedSynopsis = computed(() => {
  if (
    props.anime.synopsis &&
    props.anime.synopsis.length > synopsisLimit &&
    !isExpanded.value
  ) {
    return props.anime.synopsis.substring(0, synopsisLimit) + "...";
  }
  return props.anime.synopsis;
});

const showExpandButton = computed(() => {
  return props.anime.synopsis && props.anime.synopsis.length > synopsisLimit;
});

const toggleSynopsis = () => {
  isExpanded.value = !isExpanded.value;
};

const goToDetails = () => {
  // 可以在这里跳转到详情页，例如使用 uni.navigateTo
  // uni.navigateTo({
  //  url: `/pages/detail/detail?id=${props.anime.mal_id}`
  // });
  console.log("查看详情:", props.anime.mal_id);
  uni.showToast({
    title: `查看 ${props.anime.title_english || props.anime.title} 详情`,
    icon: "none",
  });
};

const playTrailer = () => {
  // 这里可以根据实际情况处理预告片播放
  // 例如，使用 uni.navigateTo 跳转到视频播放页，或者使用 uni.setClipboardData 复制链接
  if (props.anime.trailer && props.anime.trailer.url) {
    uni.setClipboardData({
      data: props.anime.trailer.url,
      success: () => {
        uni.showToast({
          title: "预告片链接已复制，请在浏览器中打开",
          icon: "none",
        });
      },
    });
    // 或者直接跳转到外部浏览器打开
    // plus.runtime.openURL(props.anime.trailer.url); // 仅限 App 端
  } else {
    uni.showToast({
      title: "无可用预告片",
      icon: "none",
    });
  }
  console.log("播放预告:", props.anime.trailer.youtube_id);
};
</script>

<style lang="scss" scoped>
.anime-card {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 8%);
  transition: transform 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
  }

  .card-image {
    width: 100%;
    height: 400rpx; /* 根据需要调整图片高度 */
    background-color: #f0f0f0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
    padding: 30rpx;
  }

  .title-section {
    display: flex;
    flex-direction: column;
    margin-bottom: 10rpx;

    .anime-title {
      font-size: 38rpx;
      font-weight: bold;
      line-height: 1.3;
      color: #333;
    }

    .anime-title-jp {
      margin-top: 5rpx;
      font-size: 26rpx;
      color: #666;
    }
  }

  .info-row {
    display: flex;
    align-items: baseline; /* 保持标签和值对齐 */
    font-size: 28rpx;
    color: #555;

    .info-label {
      flex-shrink: 0; /* 防止标签被压缩 */
      margin-right: 10rpx;
      font-weight: bold;
    }

    .info-value {
      flex: 1;
      color: #777;
      word-break: break-word; /* 允许长单词换行 */
    }

    .score {
      font-weight: bold;
      color: #ff9800; /* 突出评分颜色 */
    }
  }

  .genres-row {
    flex-wrap: wrap; /* 流派标签换行 */
    .genres-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx; /* 标签之间的间距 */
    }

    .genre-tag {
      padding: 8rpx 16rpx;
      font-size: 24rpx;
      color: #007bff;
      background-color: #e0f2f7;
      border-radius: 10rpx;
    }
  }

  .synopsis-section {
    margin-top: 10rpx;

    .synopsis-text {
      font-size: 28rpx;
      line-height: 1.6;
      color: #666;
    }

    .expand-btn {
      display: inline-block; /* 使其可点击 */
      margin-top: 10rpx;
      font-size: 26rpx;
      color: #007bff;
    }
  }

  .card-actions {
    display: flex;
    gap: 20rpx; /* 按钮间距 */
    justify-content: space-around; /* 按钮之间均匀分布 */
    margin-top: 20rpx;

    .action-button {
      flex: 1; /* 按钮等宽 */
      padding: 18rpx 0;
      font-size: 30rpx;
      line-height: 1; /* 解决按钮默认行高问题 */
      color: #fff;
      text-align: center;
      background-color: #007bff;
      border-radius: 10rpx;

      &:active {
        background-color: #0056b3;
      }
    }
  }
}
</style>
