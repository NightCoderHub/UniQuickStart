// 用户相关接口
import request from "../utils/request";

// 用户注册
export const register = (data) => {
  return request.post("/user/register", data);
};

// 用户登录
export const login = (data) => {
  return request.post("/user/login", data);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get("/user/info");
};

// 修改用户资料
export const updateUserInfo = (data) => {
  return request.post("/user/edit", data);
};

// 发送短信验证码
export const sendSmsCode = (mobile) => {
  return request.get("/user/sendSMS", { mobile });
};
