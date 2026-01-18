import { STATIC_DICTS, getStaticDictLabel, getStaticDictOptions } from "@/utils/dictConfig.js";
import { useDictStore } from "@/stores/modules/dict.js";

export const getDictLabel = (type, value) => {
  const staticLabel = getStaticDictLabel(type, value);
  if (staticLabel) {
    return staticLabel;
  }
  const store = useDictStore();
  const list = store.getDictFromState(type);
  const target = list.find((item) => String(item.value) === String(value));
  if (target && target.label != null) {
    return target.label;
  }
  return value != null ? String(value) : "";
};

export const getDictOptions = async (type, options = {}) => {
  if (STATIC_DICTS[type]) {
    return getStaticDictOptions(type);
  }
  const store = useDictStore();
  const result = await store.ensureDict(type, options);
  return result;
};

// 批量预加载动态字典，比如首页或 App 启动逻辑里
export const preloadDicts = async (types = []) => {
  const uniqueTypes = Array.from(new Set(types.filter(Boolean)));
  if (!uniqueTypes.length) {
    return [];
  }
  return Promise.all(uniqueTypes.map((type) => getDictOptions(type)));
};

export const dictHelper = {
  getDictLabel,
  getDictOptions,
  preloadDicts,
};
