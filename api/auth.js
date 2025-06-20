// src/api/auth.js
import network from "@/utils/request";
/**
 * 用户登录接口
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<Object>} 包含 token 和 refreshToken 的响应数据
 */
export function login({ username, password }) {
  return network.post("/oauth2/token", {
    username: username,
    password: password,
    grant_type: "password", // 根据您的OAuth2实现可能需要
    // ... 其他后端要求的参数
  });
}
