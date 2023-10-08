import { toRaw } from "vue";
import { defineStore } from "pinia";
import { pinia_store } from "@/store";
import { asyncRoutes, constantRouter } from "@/router";
const DEFAULT_CONFIG = {
    id: "id",
    children: "children",
    pid: "pid",
};
const getConfig = (config) => Object.assign({}, DEFAULT_CONFIG, config);
// @ts-ignore
function filter(tree, func, config = {}) {
    config = getConfig(config);
    const children = config.children;
    function listFilter(list) {
        return list
            .map((node) => ({ ...node }))
            .filter((node) => {
            node[children] = node[children] && listFilter(node[children]);
            return func(node) || (node[children] && node[children].length);
        });
    }
    return listFilter(tree);
}
export const useAsyncRouteStore = defineStore({
    id: "app-async-route",
    state: () => ({
        menus: asyncRoutes,
        routers: constantRouter,
        routersAdded: [],
        keepAliveComponents: [],
        // whether the route has been dynamically added
        isDynamicRouteAdded: false,
    }),
    getters: {
        getMenus() {
            return this.menus;
        },
        getIsDynamicRouteAdded() {
            return this.isDynamicRouteAdded;
        },
    },
    actions: {
        getRouters() {
            return toRaw(this.routersAdded);
        },
        setDynamicRouteAdded(added) {
            this.isDynamicRouteAdded = added;
        },
        //设置动态路由
        setRouters(routers) {
            this.routersAdded = routers;
            this.routers = constantRouter.concat(routers);
        },
        setMenus(menus) {
            // 设置动态路由
            this.menus = menus;
        },
        setKeepAliveComponents(compNames) {
            // 设置需要缓存的组件
            this.keepAliveComponents = compNames;
        },
        // @ts-ignore
        async generateRoutes(data) {
            let accessedRouters;
            const permissionList = data.permission ?? [];
            const routeFilter = (route) => {
                const { meta } = route;
                const { permissions } = meta || {};
                if (!permissions)
                    return true;
                return permissionList.some((item) => permissions.includes(item.value));
            };
            this.setRouters(asyncRoutes);
            this.setMenus(asyncRoutes);
            return toRaw(accessedRouters);
        },
    },
});
export function useAsyncRoute() {
    return useAsyncRouteStore(pinia_store);
}
//# sourceMappingURL=asyncRoute.js.map