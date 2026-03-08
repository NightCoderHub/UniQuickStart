// hooks/useDict.js
import { ref, onBeforeMount } from "vue";
import { getDictOptions } from "@/utils/dictUtil";

export function useDict(...types) {
  const dicts = ref({}); // 存储结果：{ account_type: [], ai_platform: [] }
  const loading = ref(true);

  onBeforeMount(async () => {
    // 使用 Promise.all 并行获取，但在我们的全量模式下，其实是并行取内存
    const results = await Promise.all(types.map((type) => getDictOptions(type)));

    types.forEach((type, index) => {
      dicts.value[type] = results[index];
    });
    loading.value = false;
  });

  return {
    dicts,
    loading,
  };
}
