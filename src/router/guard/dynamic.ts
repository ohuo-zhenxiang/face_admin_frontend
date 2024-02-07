import type { NavigationGuardNext, RouteLocationNormalized} from 'vue-router';
import {useRoute} from '@/store/modules/route';
import {storage} from '@/utils/Storage.ts';
import {ACCESS_TOKEN} from "@/store/mutation-types.ts";

/**
 * 动态路由
 */
export async function createDynamicRouteGuard(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
){
    const route = useRoute();
    const isLogin = Boolean(storage.get(ACCESS_TOKEN));

    // 初始化权限路由
    if (!route.isInitAuthRoute) {
        // 未登录情况下直接回到登录页，登录成功后再加载权限路由
        if (!isLogin) {
            const toName = to.name;
            if (route.isValidConstantRoute(toName as string) && !to.meta.requiresAuth) {
                next();
            } else {
                const redirect = to.fullPath;
                next({name: 'Login', path: '/login', query: {redirect}});
            }
            return false;
        }

        await route.initAuthRoute();

        if (to.name === 'not-found' || !to.name) {
            // 动态路由没有加载导致被not-found路由捕获，等待权限路由加载好了，回到之前的路由
            // 若路由是从根路由重定向过来的，重新回到根路由
            const ROOT_ROUTE_NAME = 'Root';
            const path = to.redirectedFrom?.name === ROOT_ROUTE_NAME ? '/' : to.fullPath;
            next({path, replace: true, query: to.query, hash: to.hash});
            return false;
        }

    }

    // 权限路由已经加载，仍然未找到，重定向到404
    if (to.name === 'not-found' || !to.name) {
        next({name: '404', path: '/404', replace: true});
        return false;
    }
    return true;
}