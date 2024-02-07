import {RouteRecordRaw} from "vue-router";

/**
 * 根据用户权限过滤路由
 * @param routes - 权限路由
 * @param permission - 用户权限
 */
export function filterAuthRoutesByUserPermission(routes: RouteRecordRaw[], permission: Auth.RoleType) {
    return routes.map(route => filterAuthRouteByUserPermission(route, permission)).flat(1);
}

/**
 * 单个的根据用户权限过滤路由
 */
function filterAuthRouteByUserPermission(route: RouteRecordRaw, permission: Auth.RoleType): RouteRecordRaw[] {
    const filterRoute = {...route};  // 做个靠北
    const hasPermission = !route.meta.permissions || permission === 'admin' || (route.meta.permissions as string[]).includes(permission);
    if (filterRoute.children) {
        const filterChildren = filterRoute.children.map(item => filterAuthRouteByUserPermission(item, permission)).flat(1);
        Object.assign(filterRoute, {children: filterChildren});
    }
    return hasPermission ? [filterRoute] : [];
}