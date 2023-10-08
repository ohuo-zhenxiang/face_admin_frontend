import { defineStore } from "pinia";
import { pinia_store } from "@/store";
import { ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED } from "@/store/mutation-types";
import { ResultEnum } from "@/enums/httpEnum";
import { storage } from '@/utils/Storage';
import api from "@/api/api";
export const useUserStore = defineStore({
    id: 'app-user',
    state: () => ({
        token: storage.get(ACCESS_TOKEN, {}),
        username: '',
        welcome: '',
        avatar: '',
        permissions: [],
        info: storage.get(CURRENT_USER, {}),
    }),
    getters: {
        getToken() {
            return this.token;
        },
        getAvatar() {
            return this.avatar;
        },
        getNickname() {
            return this.username;
        },
        getPermissions() {
            return this.permissions;
        },
        getUserInfo() {
            return this.info;
        },
    },
    actions: {
        setToken(token) {
            this.token = token;
        },
        setAvatar(avatar) {
            this.avatar = avatar;
        },
        setPermissions(permissions) {
            this.permissions = permissions;
        },
        setUserInfo(info) {
            this.info = info;
        },
        // 登录
        async login(params) {
            try {
                const post_params = new URLSearchParams();
                post_params.append('username', params.username);
                post_params.append('password', params.password);
                const response = await api.post('/api/login/access-token', post_params);
                const { data, status } = response;
                if (status === ResultEnum.SUCCESS) {
                    const ex = 7 * 24 * 60 * 60;
                    storage.set(ACCESS_TOKEN, data, ex);
                    storage.set(CURRENT_USER, data, ex);
                    storage.set(IS_SCREENLOCKED, false);
                    this.setToken(data.access_token);
                    this.setUserInfo(data);
                }
                return response;
            }
            catch (err) {
                console.log(err);
                return err.response;
            }
        },
        // 获取用户信息
        // async getInfo() {
        //     const result = await getUserInfoApi();
        //     if (result.permissions && result.permissions.length) {
        //         const permissionsList = result.permissions;
        //         this.setPermissions(permissionsList);
        //         this.setUserInfo(result);
        //     } else {
        //         throw new Error('getInfo: permissionsList must be a non-null a ')
        //     }
        //     this.setAvatar('');
        //     return result;
        // },
        // 登出
        async logout() {
            this.setPermissions([]);
            this.setUserInfo({ name: '', email: '' });
            storage.remove(ACCESS_TOKEN);
            storage.remove(CURRENT_USER);
        },
    },
});
export function useUser() {
    return useUserStore(pinia_store);
}
//# sourceMappingURL=user.js.map