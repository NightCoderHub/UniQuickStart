import { defineStore } from "pinia";
import request from "@/utils/request";
import { STATIC_DICTS } from "@/utils/dictConfig.js";

const DICT_STORAGE_KEY = "APP_DICT_CACHE";

const readCache = () => {
  const cache = uni.getStorageSync(DICT_STORAGE_KEY);
  if (cache && typeof cache === "object") {
    return cache;
  }
  return {};
};

const writeCache = (dictMap) => {
  uni.setStorageSync(DICT_STORAGE_KEY, dictMap);
};

export const useDictStore = defineStore("dict", {
  state: () => ({
    dictMap: readCache(),
  }),
  actions: {
    setDict(type, options) {
      const normalized = Array.isArray(options) ? options : [];
      this.dictMap = {
        ...this.dictMap,
        [type]: normalized,
      };
      writeCache(this.dictMap);
    },
    getDictFromState(type) {
      return this.dictMap[type] || [];
    },
    hasDict(type) {
      const list = this.getDictFromState(type);
      return Array.isArray(list) && list.length > 0;
    },
    async fetchDictFromApi(type) {
      if (STATIC_DICTS[type]) {
        const list = STATIC_DICTS[type];
        this.setDict(type, list);
        return list;
      }
      const res = await request.get("/dict/options", { type });
      const list = Array.isArray(res) ? res : Array.isArray(res?.options) ? res.options : [];
      this.setDict(type, list);
      return list;
    },
    async ensureDict(type, options = {}) {
      const { forceReload = false } = options;
      if (!forceReload && this.hasDict(type)) {
        return this.getDictFromState(type);
      }
      return this.fetchDictFromApi(type);
    },
  },
});
