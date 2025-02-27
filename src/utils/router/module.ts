import {RouteRecordRaw} from "vue-router";
import {AuthRoute, RouteModule} from "@/types/route";

/**
 * 权限路由排序
 * @param routes - 权限路由
 */
export function sortRoutes(routes: RouteRecordRaw[]) {
    return routes
        .sort((next, pre) => Number(next.meta?.sort) - Number(pre.meta?.sort))
        .map(i => {
            if (i.children) sortRoutes(i.children);
            return i;
        });
}

/**
 * 处理全部导入的路由模块
 * @param modules - 路由模块
 */
export function handleModuleRoutes(modules: AuthRoute.RouteModule) {
    const routes: RouteRecordRaw[] = [];

    Object.keys(modules).forEach(key => {
        const item = modules[key].default;
        if (item) {
            routes.push(item);
        } else {
            window.console.error(`路由模块解析出错: key = ${key}`);
        }
    });

    return sortRoutes(routes);
}