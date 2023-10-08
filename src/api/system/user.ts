import api from '@/api/api'
import {http} from '@/utils/http/axios';

export interface BasicResponseModel<T = any> {
    code: number;
    message: string;
    result: T;
}

export interface BasicPageParams {
    pageNumber: number;
    pageSize: number;
    total: number;
}

/*@description: 获取用户信息*/
export function getUserInfo() {
    return api.request({
        url: '/admin_info',
        method: 'get',
    });
}

/*@description: 用户登录*/
export async function login(username:string, password:string) {
    const post_params = new URLSearchParams();
    post_params.append('username', username as string);
    post_params.append('password', password as string);
    const response = api.post('/api/login/access-token', post_params)
    return response;
    }
    // return httpT.request<BasicResponseModel>(
    //     {
    //         url: '/login/access-token',
    //         method: 'POST',
    //         params,
    //     },
    //     {
    //         isTransformResponse: false,
    //     }
    // );


/*@description: 用户修改密码*/
export function changePassword(params, uid) {
    return http.request(
        {
            url: `/user/u${uid}/changepw`,
            method: 'POST',
            params,
        },
        {
            isTransformResponse: false,
        }
    );
}

/*@description: 用户登出*/
export function logout(params) {
    return http.request({
        url: '/login/logout',
        method: 'POST',
        params,
    });
}