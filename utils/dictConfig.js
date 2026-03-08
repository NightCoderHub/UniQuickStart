export const STATIC_DICTS = {
  gender: [
    { label: "男", value: "1" },
    { label: "女", value: "2" },
    { label: "未知", value: "0" },
  ],
  boolean: [
    { label: "是", value: "1" },
    { label: "否", value: "0" },
  ],
  enable_status: [
    { label: "启用", value: "1" },
    { label: "停用", value: "0" },
  ],
};

export const getStaticDictOptions = (type) => STATIC_DICTS[type] || [];

export const getStaticDictLabel = (type, value) => {
  const list = getStaticDictOptions(type);
  const target = list.find((item) => String(item.value) === String(value));
  return target ? target.label : "";
};

export const getStaticDictValue = (type, label) => {
  const list = getStaticDictOptions(type);
  const target = list.find((item) => item.label === label);
  return target ? target.value : "";
};
