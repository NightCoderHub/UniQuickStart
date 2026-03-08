import { STATIC_DICTS, getStaticDictLabel, getStaticDictOptions, getStaticDictValue } from "@/utils/dictConfig.js";
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

export const getDictValue = (type, label) => {
  // 1. 优先检查静态字典
  const staticValue = getStaticDictValue(type, label);
  if (staticValue) {
    return staticValue;
  }

  // 2. 检查动态字典
  const store = useDictStore();
  const list = store.getDictFromState(type);
  const target = list.find((item) => item.label === label);

  if (target && target.value != null) {
    return target.value;
  }
  return label || "";
};

export const getDictOptions = async (type) => {
  // 1. 优先检查静态字典
  if (STATIC_DICTS[type]) {
    return getStaticDictOptions(type);
  }

  const store = useDictStore();

  // 2. 如果 Store 已经初始化好了，直接同步返回
  if (store.isInitialized) {
    return store.getDictFromState(type);
  }

  // 3. 如果还没加载好，则等待加载完成
  await store.initAllDicts();
  return store.getDictFromState(type);
};

// 批量预加载动态字典，比如首页或 App 启动逻辑里
export const preloadDicts = async () => {
  const store = useDictStore();
  // 检查是否已经加载过，避免重复请求全量数据
  if (store.isInitialized) {
    return;
  }

  // 调用 store 中的初始化方法
  return await store.initAllDicts();
};

export const dictHelper = {
  getDictLabel,
  getDictValue,
  getDictOptions,
  preloadDicts,
};
