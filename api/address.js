// 地址相关接口
import request from "../utils/request";

// 查询地址列表
export const getAddressList = () => {
  return request.get("/user/listAddress");
};

// 新增/编辑地址
export const saveAddress = (data) => {
  return request.post("/user/saveAddress", data);
};

// 删除地址
export const removeAddress = (data) => {
  return request.get("/user/deleteAddress", data);
};
