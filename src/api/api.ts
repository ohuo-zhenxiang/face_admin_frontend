// 针对fastapi的接口对axios进行二次封装
import axios from 'axios';
import {useUserStore} from "@/store/modules/user";


// 创建axios实例
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOB_PROD_BASE_URL : import.meta.env.VITE_PRODUCTION_URL,
    timeout: 60000,
});

type Token = {
    access_token: string;
    token_type: string;
}

// 请求拦截器
api.interceptors.request.use(
    config => {
        const token: string = useUserStore().getToken;
        const token_type: string = 'bearer'; // 为了跟后端保持一致
        if (token) {
            config.headers.Authorization = `${token_type} ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

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

