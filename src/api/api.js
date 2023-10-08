// 针对fastapi的接口对axios进行二次封装
import axios from 'axios';
import { useUserStore } from "@/store/modules/user";
// 创建axios实例
const api = axios.create({
    baseURL: import.meta.env.VITE_GLOB_PROD_BASE_URL,
    timeout: 5000,
});
// 请求拦截器
api.interceptors.request.use(config => {
    const token = useUserStore().getToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});
//响应拦截器
// api.interceptors.response.use(
//     response => {
//         return response;
//     },
//     // (response) => {
//     //   const { data } = response;
//     //   if (data.code === 200) {
//     //     return data.data;
//     //   } else {
//     //     return Promise.reject(data.message);
//     //   }
//     // },
//     error => {
//         return Promise.reject(error);
//     },
// );
export default api;
//# sourceMappingURL=api.js.map