/** 用户相关模块 **/
declare namespace Auth {
    /**
     * 用户角色类型（前端静态路由用角色类型进行路由权限的控制）
     * - admin: 啥都有
     * - user: 只能看
     */
    type RoleType = 'admin' | 'user';

    interface UserInfo {
        id: number | null;
        full_name: string;
        phone: string;
        is_active: boolean;
        is_superuser: boolean;
        role: RoleType;
        permissions: string;
    }
}