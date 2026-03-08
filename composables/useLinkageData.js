import { reactive, ref, onUnmounted } from "vue";

/**
 * 多级联动数据管理 Hook
 * @param {Object} config 配置项
 */
export function useLinkageData(config) {
  const {
    levels = [], // 层级配置
    cache = true, // 是否开启缓存
    immediate = true, // 是否立即初始化
    defaultValues = {}, // 默认值
  } = config;

  // --- 响应式状态 ---
  const values = reactive({}); // 各级选中的值
  const optionsMap = reactive({}); // 各级下拉列表数据
  const loadingMap = reactive({}); // 各级加载状态
  const errorMap = reactive({}); // 各级错误状态
  const isInitializing = ref(false); // 全局初始化锁

  // --- 内部变量 ---
  const levelIndexMap = {}; // key -> index 映射
  const cacheMap = new Map(); // 数据缓存
  const controllerMap = {}; // 请求撤销控制器
  const dependencyGraph = {}; // 依赖图: { depKey: [affectedKey1, affectedKey2] }

  // --- 辅助工具 ---
  const isValid = (val) => val !== null && val !== undefined && val !== "";

  // 1. 初始化结构与构建依赖图
  levels.forEach((level, index) => {
    const { key, parentKey, deps = [] } = level;
    levelIndexMap[key] = index;
    values[key] = "";
    optionsMap[key] = [];
    loadingMap[key] = false;
    errorMap[key] = null;

    // 收集所有依赖（包括直接父级和其他依赖项）
    const allDeps = [parentKey, ...deps].filter(Boolean);
    allDeps.forEach((dep) => {
      if (!dependencyGraph[dep]) dependencyGraph[dep] = [];
      dependencyGraph[dep].push(key);
    });
  });

  /**
   * 取消某一级正在进行的请求
   */
  function abortLevel(levelKey) {
    if (controllerMap[levelKey]) {
      controllerMap[levelKey].abort();
      controllerMap[levelKey] = null;
    }
  }

  /**
   * 获取某一级的所有依赖参数包
   */
  function getLevelParams(levelKey) {
    const level = levels[levelIndexMap[levelKey]];
    const params = {};
    const allDeps = [level.parentKey, ...(level.deps || [])].filter(Boolean);
    allDeps.forEach((d) => {
      params[d] = values[d];
    });
    return params;
  }

  /**
   * 校验当前选中的值是否在选项列表中
   */
  function validateValue(key) {
    const val = values[key];
    if (isValid(val)) {
      const exists = optionsMap[key].some((opt) => String(opt.value) === String(val));
      if (!exists) values[key] = "";
    }
  }

  /**
   * 加载单级数据
   */
  async function loadLevel(levelKey, forceReload = false) {
    const level = levels[levelIndexMap[levelKey]];
    if (!level) return;

    // 如果有父级但父级无值，直接清空并跳过请求
    if (level.parentKey && !isValid(values[level.parentKey])) {
      optionsMap[levelKey] = [];
      values[levelKey] = "";
      return;
    }

    const params = getLevelParams(levelKey);
    const cacheKey = `${levelKey}_${JSON.stringify(params)}`;

    // 命中缓存
    if (cache && !forceReload && cacheMap.has(cacheKey)) {
      optionsMap[levelKey] = cacheMap.get(cacheKey);
      validateValue(levelKey);
      return;
    }

    abortLevel(levelKey);
    const controller = new AbortController();
    controllerMap[levelKey] = controller;

    loadingMap[levelKey] = true;
    errorMap[levelKey] = null;

    try {
      const parentVal = level.parentKey ? values[level.parentKey] : undefined;
      const data = await level.fetcher(parentVal, params, {
        signal: controller.signal,
        allValues: values,
      });

      if (controller.signal.aborted) return;

      const finalData = Array.isArray(data) ? data : [];
      optionsMap[levelKey] = finalData;
      validateValue(levelKey);

      if (cache) cacheMap.set(cacheKey, finalData);
    } catch (err) {
      if (err.name !== "AbortError") {
        errorMap[levelKey] = err;
        optionsMap[levelKey] = [];
      }
    } finally {
      if (!controller.signal.aborted) {
        loadingMap[levelKey] = false;
      }
    }
  }

  /**
   * 获取受影响的所有下游节点（拓扑序）
   */
  function getAffectedLevels(startKey) {
    const affected = new Set();
    const queue = [startKey];
    while (queue.length > 0) {
      const key = queue.shift();
      const children = dependencyGraph[key] || [];
      children.forEach((child) => {
        if (!affected.has(child)) {
          affected.add(child);
          queue.push(child);
        }
      });
    }
    return Array.from(affected).sort((a, b) => levelIndexMap[a] - levelIndexMap[b]);
  }

  /**
   * 设置值并触发联动刷新
   */
  async function setValue(key, value) {
    // 移除值相等判断，因为 v-model 会先更新 values[key]，导致此处判断为 true 而直接返回，
    // 从而无法触发后续的级联重置逻辑。
    // if (values[key] === value) return

    values[key] = value;

    const affectedKeys = getAffectedLevels(key);
    console.log("affectedKeys", affectedKeys);

    // 立即重置下游状态，避免界面显示脏数据
    affectedKeys.forEach((k) => {
      values[k] = "";
      optionsMap[k] = [];
      abortLevel(k);
    });
    // 依次加载受影响的层级
    for (const k of affectedKeys) {
      await loadLevel(k);
    }
  }

  /**
   * 稳健的初始化回显
   */
  async function init(initialValues = {}) {
    if (isInitializing.value) return;
    isInitializing.value = true;

    try {
      // 按 levels 定义的物理顺序回显
      for (const level of levels) {
        const key = level.key;
        const targetVal = initialValues[key];

        await loadLevel(key);

        if (isValid(targetVal)) {
          const exists = optionsMap[key].some((opt) => String(opt.value) === String(targetVal));
          if (exists) {
            values[key] = targetVal;
          } else {
            console.warn(`[Linkage] Value ${targetVal} not found for ${key}`);
            break; // 链路断开，停止后续回显
          }
        } else {
          break; // 无初始值，停止后续链路
        }
      }
    } finally {
      isInitializing.value = false;
    }
  }

  function resetAll() {
    levels.forEach((l) => {
      abortLevel(l.key);
      values[l.key] = "";
      // 只清空有父级依赖的选项，保留根节点选项，避免重置后无法重新选择
      if (l.parentKey) {
        optionsMap[l.key] = [];
      }
    });
    // cacheMap.clear()
  }

  // 自动执行初始化
  if (immediate) {
    if (Object.keys(defaultValues).length) {
      init(defaultValues);
    } else if (levels[0]) {
      loadLevel(levels[0].key);
    }
  }

  // 组件卸载自动清理请求
  onUnmounted(() => {
    Object.keys(controllerMap).forEach((key) => abortLevel(key));
  });

  return {
    values,
    optionsMap,
    loadingMap,
    errorMap,
    isInitializing,
    setValue,
    init,
    resetAll,
    reloadLevel: (key) => loadLevel(key, true),
  };
}
