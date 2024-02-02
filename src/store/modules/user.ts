import {defineStore} from "pinia";
import {pinia_store} from "@/store";
import {ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED} from "@/store/mutation-types";
import {ResultEnum} from "@/enums/httpEnum";
import {loginGetToken, getUserInfo} from '@/api/login';
import {storage} from '@/utils/Storage';

type LoginParams = {
    username: string,
    password: string,
}

export type UserInfoType = {
    // TODO: add your own data
    full_name: string;
    phone: string;
    id: number | null;
    is_active: boolean;
    is_superuser: boolean;
    permissions: string;
};

export interface IUserState {
    token: string;
    username: string;
    welcome: string;
    avatar: string;
    permissions: any[];
    info: UserInfoType;
}

export const useUserStore = defineStore({
    id: 'app-user',
    state: (): IUserState => ({
        token: storage.get(ACCESS_TOKEN, {}), // 本地缓存中取
        username: '',
        welcome: '',
        permissions: [],
        info: storage.get(CURRENT_USER, {}),
    }),
    getters: {
        getToken(): string {
            return this.token;
        },
        getNickname(): string {
            return this.username
        },
        getPermissions(): [any][] {
            return this.permissions;
        },
        getUserInfo(): UserInfoType {
            return this.info;
        },
    },
    actions: {
        setToken(token: string) {
            this.token = token;
        },
        setPermissions(permissions: any) {
            this.permissions = permissions;
        },
        setUserInfo(info: UserInfoType) {
            this.info = info;
        },
        // 登录
        async login(params: LoginParams) {
            try {
                const response = await loginGetToken(params)
                const {data, status} = response
                if (status === ResultEnum.SUCCESS) {
                    const ex = 7 * 24 * 60 * 60;
                    storage.set(ACCESS_TOKEN, data.access_token, ex);
                    storage.set(CURRENT_USER, data, ex);
                    storage.set(IS_SCREENLOCKED, false);
                    this.setToken(data.access_token);
                    this.setUserInfo(data);
                }
                return response;
            } catch (err: any) {
                console.log(err)
                return err.response;
            }

        },

        // 获取用户信息
        async getInfo() {
            const result = await getUserInfo();
            // 主要是从后端获取动态路由，前提前端设置了使用动态路由，否则就是使用的前端静态路由
            const a = result.data.permissions;
            const permissions = JSON.parse(a)
            if (permissions && permissions.length) {
                const permissionsList = permissions;
                this.setPermissions(permissionsList);
                this.setUserInfo(result.data);
            } else {
                throw new Error('getInfo: permissionsList must be a non-null a ')
            }
            return result.data;
        },
        // 登出
        async logout() {
            this.setPermissions([]);
            this.setUserInfo({
                full_name: '',
                phone: '',
                id: null,
                is_superuser: false,
                is_active: false,
                permissions: ''
            });
            storage.remove(ACCESS_TOKEN);
            storage.remove(CURRENT_USER);
        },
    },
});

export function useUser() {
    return useUserStore(pinia_store);
}