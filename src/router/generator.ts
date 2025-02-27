import {constantRouterIcon} from './icons';
import {RouteRecordRaw} from 'vue-router';
import {Layout, ParentLayout} from '@/router/constant';
import type {AppRouteRecordRaw} from '@/router/types';

const Iframe = () => import('@/views/iframe/index.vue');
const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>();

LayoutMap.set('LAYOUT', Layout);
LayoutMap.set('IFRAME', Iframe);

/**
 * 格式化 后端 结构信息并递归生成层级路由表
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generateRoutes = (routerMap, parent?): any[] => {
    return routerMap.map((item) => {
        const currentRoute: any = {
            // 路由地址 动态拼接生成如 /dashboard/workplace
            path: `${(parent && parent.path) ?? ''}/${item.path}`,
            // 路由名称，建议唯一
            name: item.name ?? '',
            // 该路由对应页面的 组件
            component: item.component,
            // meta: 页面标题、菜单图标
            meta: {
                ...item.meta,
                label: item.meta.title,
                icon: constantRouterIcon[item.meta.icon] || null,
                permissions: item.meta.permissons || null,
            },
        };

        // 为了防止出现后端返回结果不规范，处理有可能出现拼接处两个 反斜杠
        currentRoute.path = currentRoute.path.replace('//', '/');
        // 重定向
        item.redirect && (currentRoute.redirect = item.redirect);
        // 是否有子菜单，并递归处理
        if (item.children && item.children.length > 0) {
            // 如果未定义 redirect 默认第一个子路由为 redirect
            !item.redirect && (currentRoute.redirect = `${item.path}/${item.children[0].path}`);
            // Recursion
            currentRoute.children = generateRoutes(item.children, currentRoute);
        }
        return currentRoute;
    });
};

/**
 * 动态生成菜单
 * @returns {Promise<Router>}
 */
// export const generateDynamicRoutes = async (): Promise<RouteRecordRaw[]> = {
//     const result = await adminMenus();
// }

