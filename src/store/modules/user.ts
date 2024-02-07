import {defineStore} from "pinia";
import {pinia_store} from "@/store";
import {ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED} from "@/store/mutation-types";
import {ResultEnum} from "@/enums/httpEnum";
import {loginGetToken, getLoginUserInfo} from '@/api/login';
import {storage} from '@/utils/Storage';

type LoginParams = {
    username: string,
    password: string,
}

export interface IUserState {
    token: string;
    username: string;
    welcome: string;
    avatar: string;
    routes: any[];
    info: Auth.UserInfo;
}

export const useUserStore = defineStore({
    id: 'app-user',
    state: (): IUserState => ({
        token: storage.get(ACCESS_TOKEN, {}), // 本地缓存中取
        username: '',
        welcome: '',
        routes: [],
        info: storage.get(CURRENT_USER, {}),
    }),
    getters: {
        getToken(): string {
            return this.token;
        },
        getNickname(): string {
            return this.username
        },
        getRoutes(): [any][] {
            return this.routes;
        },
        getUserInfo(): Auth.UserInfo {
            return this.info;
        },
        getUserRole(): string {
            return this.info.role;
        }
    },
    actions: {
        setToken(token: string) {
            this.token = token;
        },
        setRoutes(routes: any) {
            this.routes = routes;
        },
        setUserInfo(info: Auth.UserInfo) {
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
            const result = await getLoginUserInfo();
            // 主要是从后端获取动态路由，前提前端设置了使用动态路由，否则就是使用的前端静态路由
            const a = result.data.routes;
            const routes = JSON.parse(a)
            if (routes && routes.length) {
                const routesList = routes;
                this.setRoutes(routesList);
                this.setUserInfo(result.data);
                storage.set(CURRENT_USER, result.data);
            } else {
                throw new Error('getInfo: RoutesList must be a non-null a ')
            }
            return result.data;
        },
        // 登出
        async logout() {
            this.setRoutes([]);
            this.setUserInfo({
                full_name: '',
                phone: '',
                id: null,
                is_superuser: false,
                is_active: false,
                routes: ''
            });
            storage.remove(ACCESS_TOKEN);
            storage.remove(CURRENT_USER);
            storage.remove(IS_SCREENLOCKED);
        },
    },
});

export function useUser() {
    return useUserStore(pinia_store);
}