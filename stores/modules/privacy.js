import { defineStore } from "pinia";

export const usePrivacyStore = defineStore("privacy", {
  state: () => ({
    privacyAgreed: !!uni.getStorageSync("privacy_policy_agreed"),
    browsingMode: !!uni.getStorageSync("browsing_mode"),
  }),
  getters: {
    isAgreed: (state) => !!state.privacyAgreed,
    isBrowsing: (state) => !!state.browsingMode,
  },
  actions: {
    setAgreed(val) {
      this.privacyAgreed = !!val;
      uni.setStorageSync("privacy_policy_agreed", this.privacyAgreed);
    },
    setBrowsingMode(val) {
      this.browsingMode = !!val;
      uni.setStorageSync("browsing_mode", this.browsingMode);
    },
    refreshFromStorage() {
      this.privacyAgreed = !!uni.getStorageSync("privacy_policy_agreed");
      this.browsingMode = !!uni.getStorageSync("browsing_mode");
    },
    ensureAgreedForLogin() {
      if (!this.privacyAgreed || this.browsingMode) {
        this.setAgreed(true);
        this.setBrowsingMode(false);
      }
    },
  },
});
