<template>
  <view class="publish-post">
    <scroll-view class="content-scroll" scroll-y>
      <!-- 内容输入区域 -->
      <view class="content-section">
        <textarea
          v-model="postContent"
          class="content-input"
          placeholder="分享你的想法..."
          :maxlength="500"
          auto-height
        ></textarea>

        <view class="privacy-notice">
          <text class="notice-text">（保护隐私不要填写任何联系方式）</text>
        </view>

        <!-- 图片上传区域 -->
        <view class="image-upload-section">
          <view class="image-grid">
            <view
              v-for="(image, index) in uploadedImages"
              :key="index"
              class="image-item"
            >
              <image
                :src="image"
                class="uploaded-image"
                mode="aspectFill"
              ></image>
              <view class="delete-btn" @click="deleteImage(index)">
                <wd-icon name="close" size="16px" color="#fff"></wd-icon>
              </view>
            </view>

            <view
              v-if="uploadedImages.length < 9"
              class="upload-placeholder camera-placeholder"
              @click="chooseImage"
            >
              <wd-icon name="camera" size="32px" color="#ccc"></wd-icon>
            </view>

            <view
              v-if="uploadedImages.length < 8"
              class="upload-placeholder add-placeholder"
              @click="chooseImage"
            >
              <wd-icon name="add" size="32px" color="#ccc"></wd-icon>
            </view>
          </view>
        </view>
      </view>

      <!-- 标签选择区域 -->
      <view class="tags-section">
        <view class="section-header">
          <wd-button
            type="text"
            size="small"
            custom-style="color: #999; padding: 4px 8px; background: #f5f5f5; border-radius: 16px;"
            @click="showAddTagInput"
          >
            #添加标签
          </wd-button>
        </view>

        <view class="tags-list">
          <wd-button
            v-for="tag in availableTags"
            :key="tag.id"
            :type="selectedTags.includes(tag.id) ? 'success' : 'text'"
            size="small"
            :custom-style="getTagStyle(tag.id)"
            class="tag-button"
            @click="toggleTag(tag.id)"
          >
            {{ tag.text }}
          </wd-button>
        </view>
      </view>

      <!-- 位置选择区域 -->
      <view class="location-section">
        <view class="section-title" @click="showLocationPicker">
          <text class="title-text">你在哪里</text>
          <wd-icon name="arrow-right" size="16px" color="#999"></wd-icon>
        </view>

        <view class="location-tags">
          <wd-button
            v-for="location in availableLocations"
            :key="location.id"
            :type="selectedLocation === location.id ? 'success' : 'text'"
            size="small"
            :custom-style="getLocationStyle(location.id)"
            class="location-button"
            @click="selectLocation(location.id)"
          >
            {{ location.text }}
          </wd-button>
        </view>
      </view>

      <!-- 发布条款 -->
      <view class="terms-section">
        <view class="term-item" @click="toggleTerms">
          <wd-icon
            :name="agreeTerms ? 'check-circle' : 'circle'"
            :color="agreeTerms ? '#52c41a' : '#d9d9d9'"
            size="20px"
          ></wd-icon>
          <text class="term-text">发布条款 我同意条款，保证信息合法合规</text>
          <wd-icon
            name="help-circle"
            size="16px"
            color="#ccc"
            @click.stop="showTermsHelp"
          ></wd-icon>
        </view>

        <view class="term-item" @click="toggleNotice">
          <wd-icon
            :name="agreeNotice ? 'check-circle' : 'circle'"
            :color="agreeNotice ? '#52c41a' : '#d9d9d9'"
            size="20px"
          ></wd-icon>
          <text class="term-text">发布须知</text>
          <wd-icon
            name="help-circle"
            size="16px"
            color="#ccc"
            @click.stop="showNoticeHelp"
          ></wd-icon>
        </view>
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="publish-section">
      <wd-button
        type="success"
        size="large"
        block
        :disabled="!canPublish"
        custom-style="border-radius: 8px; font-size: 18px; font-weight: 500;"
        @click="publishPost"
      >
        发布
      </wd-button>
    </view>

    <!-- 添加标签弹窗 -->
    <wd-popup
      v-model="showAddTag"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view class="add-tag-popup">
        <view class="popup-header">
          <text class="popup-title">添加标签</text>
          <wd-button type="text" @click="closeAddTag">取消</wd-button>
        </view>
        <view class="popup-content">
          <wd-input
            v-model="newTagText"
            placeholder="输入自定义标签"
            :maxlength="20"
          ></wd-input>
        </view>
        <view class="popup-footer">
          <wd-button type="success" block @click="addCustomTag"
            >确认添加</wd-button
          >
        </view>
      </view>
    </wd-popup>

    <!-- 位置选择弹窗 -->
    <wd-popup
      v-model="showLocationPopup"
      position="bottom"
      :close-on-click-modal="true"
    >
      <view class="location-popup">
        <view class="popup-header">
          <text class="popup-title">选择位置</text>
          <wd-button type="text" @click="closeLocationPopup">取消</wd-button>
        </view>
        <view class="popup-content">
          <view class="location-list">
            <view
              v-for="location in allLocations"
              :key="location.id"
              class="location-item"
              @click="confirmLocation(location.id)"
            >
              <text class="location-name">{{ location.text }}</text>
              <wd-icon
                v-if="selectedLocation === location.id"
                name="check"
                color="#52c41a"
                size="20px"
              ></wd-icon>
            </view>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      postContent: "想在容力国际找一份工作，不要太时间长，不要太辛苦 #求职招聘",
      uploadedImages: [],
      selectedTags: [3], // 默认选中求职招聘
      selectedLocation: 1, // 默认选中第一个位置
      agreeTerms: true,
      agreeNotice: true,
      showAddTag: false,
      showLocationPopup: false,
      newTagText: "",

      availableTags: [
        { id: 1, text: "#闲置物品" },
        { id: 2, text: "#房屋租售" },
        { id: 3, text: "#求职招聘" },
        { id: 4, text: "#生意转让" },
        { id: 5, text: "#寻物启事" },
      ],

      availableLocations: [
        { id: 1, text: "铜仁市县江区河两街道..." },
        { id: 2, text: "铜仁市县江区河两街道..." },
        { id: 3, text: "铜仁市..." },
      ],

      allLocations: [
        { id: 1, text: "铜仁市县江区河两街道花果山中路8号" },
        { id: 2, text: "铜仁市县江区河两街道人民路123号" },
        { id: 3, text: "铜仁市碧江区南长城路鞋区a2栋" },
        { id: 4, text: "铜仁市万山区茶店街道办事处" },
      ],
    };
  },

  computed: {
    canPublish() {
      return (
        this.postContent.trim().length > 0 &&
        this.agreeTerms &&
        this.agreeNotice
      );
    },
  },

  methods: {
    // 选择图片
    chooseImage() {
      const remainingCount = 9 - this.uploadedImages.length;

      uni.chooseImage({
        count: remainingCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths];
        },
      });
    },

    // 删除图片
    deleteImage(index) {
      this.uploadedImages.splice(index, 1);
    },

    // 切换标签选择
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tagId);
      }
    },

    // 获取标签样式
    getTagStyle(tagId) {
      const isSelected = this.selectedTags.includes(tagId);
      return isSelected
        ? "background: #52c41a; color: #fff; border-radius: 16px; margin: 4px;"
        : "background: #f5f5f5; color: #666; border-radius: 16px; margin: 4px;";
    },

    // 选择位置
    selectLocation(locationId) {
      this.selectedLocation = locationId;
    },

    // 获取位置样式
    getLocationStyle(locationId) {
      const isSelected = this.selectedLocation === locationId;
      return isSelected
        ? "background: #52c41a; color: #fff; border-radius: 16px; margin: 4px;"
        : "background: #f5f5f5; color: #666; border-radius: 16px; margin: 4px;";
    },

    // 显示位置选择器
    showLocationPicker() {
      this.showLocationPopup = true;
    },

    // 关闭位置选择器
    closeLocationPopup() {
      this.showLocationPopup = false;
    },

    // 确认位置选择
    confirmLocation(locationId) {
      this.selectedLocation = locationId;
      this.showLocationPopup = false;
    },

    // 显示添加标签输入
    showAddTagInput() {
      this.showAddTag = true;
    },

    // 关闭添加标签
    closeAddTag() {
      this.showAddTag = false;
      this.newTagText = "";
    },

    // 添加自定义标签
    addCustomTag() {
      if (this.newTagText.trim()) {
        const newTag = {
          id: Date.now(),
          text: this.newTagText.startsWith("#")
            ? this.newTagText
            : `#${this.newTagText}`,
        };
        this.availableTags.push(newTag);
        this.selectedTags.push(newTag.id);
        this.closeAddTag();
      }
    },

    // 切换条款同意
    toggleTerms() {
      this.agreeTerms = !this.agreeTerms;
    },

    // 切换须知同意
    toggleNotice() {
      this.agreeNotice = !this.agreeNotice;
    },

    // 显示条款帮助
    showTermsHelp() {
      uni.showModal({
        title: "发布条款",
        content: "请确保发布的内容真实、合法、合规，不包含违法违规信息。",
        showCancel: false,
      });
    },

    // 显示须知帮助
    showNoticeHelp() {
      uni.showModal({
        title: "发布须知",
        content: "发布内容将公开展示，请注意保护个人隐私信息。",
        showCancel: false,
      });
    },

    // 发布动态
    publishPost() {
      if (!this.canPublish) {
        uni.showToast({
          title: "请完善发布信息",
          icon: "none",
        });
        return;
      }

      uni.showLoading({
        title: "发布中...",
      });

      // 模拟发布请求
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: "发布成功",
          icon: "success",
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 2000);
    },
  },
};
</script>

<style lang="scss" scoped>
.publish-post {
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* 内容滚动区域 */
.content-scroll {
  flex: 1;
  padding: 16px;
}

/* 内容输入区域 */
.content-section {
  margin-bottom: 24px;

  .content-input {
    width: 100%;
    min-height: 120px;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    border: none;
    resize: none;
    outline: none;
  }

  .privacy-notice {
    margin: 8px 0 16px;

    .notice-text {
      font-size: 12px;
      color: #999;
    }
  }

  .image-upload-section {
    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .image-item {
        position: relative;
        aspect-ratio: 1;

        .uploaded-image {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .delete-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .upload-placeholder {
        aspect-ratio: 1;
        background: #f5f5f5;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.camera-placeholder {
          background: #f5f5f5;
        }

        &.add-placeholder {
          background: #fafafa;
        }
      }
    }
  }
}

/* 标签选择区域 */
.tags-section {
  margin-bottom: 24px;

  .section-header {
    margin-bottom: 12px;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-button {
      border-radius: 16px;
      font-size: 14px;
    }
  }
}

/* 位置选择区域 */
.location-section {
  margin-bottom: 24px;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .title-text {
      font-size: 16px;
      color: #333;
    }
  }

  .location-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .location-button {
      border-radius: 16px;
      font-size: 14px;
    }
  }
}

/* 发布条款 */
.terms-section {
  margin-bottom: 24px;

  .term-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .term-text {
      flex: 1;
      font-size: 14px;
      color: #333;
    }
  }
}

/* 发布按钮 */
.publish-section {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 弹窗样式 */
.add-tag-popup,
.location-popup {
  background: #fff;
  border-radius: 12px 12px 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .popup-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  .popup-content {
    padding: 20px 16px;
  }

  .popup-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
  }
}

.location-popup {
  .location-list {
    .location-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .location-name {
        font-size: 16px;
        color: #333;
      }
    }
  }
}
</style>
