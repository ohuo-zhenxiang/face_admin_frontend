import {defineStore} from 'pinia';
import {RootRoute, constantRouter, router, routeModuleList as staticRoutes} from "@/router/index.ts";
import {getLoginUserInfo} from "@/api/login.ts";
import {storage} from "@/utils/Storage.ts";
import {
    filterAuthRoutesByUserPermission,
    getCacheRoutes,
    getConstantRouteNames,
    transformAuthRouteToVueRoutes,
    transformAuthRouteToVueRoute,
    transformAuthRouteToMenu,
    transformRouteNameToRoutePath,
    transformRoutePathToRouteName,
    sortRoutes,
} from "@/utils/router";
import {useUser} from "@/store/modules/user.ts";
import {MenuOption} from 'naive-ui';
import {RouteRecordRaw} from "vue-router";
import {CURRENT_USER} from "@/store/mutation-types.ts";
import {pinia_store} from "@/store";

interface RouteState {
    /**
     * 权限路由模式:
     * - static - 前端声明的静态
     * - dynamic - 后端返回的动态
     */
    authRouteMode: ImportMetaEnv.VITE_AUTH_ROUTE_MODE;
    /** 是否初始化了权限路由 **/
    isInitAuthRoute: boolean;
    /** 路由首页name(前端静态路由时生效，后端动态路由该值会被后端返回的值覆盖) **/
    routeHomeName: string;
    /** 菜单 **/
    menus: MenuOption[];
    /** 缓存的路由名称 **/
    cacheRoutes: string[];
    /** 路由列表(权限筛选后的） **/
    filteredRoutes: RouteRecordRaw[];
}


export const useRouteStore = defineStore('route-store', {
    state: (): RouteState => ({
        authRouteMode: import.meta.env.VITE_AUTH_ROUTE_MODE,
        isInitAuthRoute: false,
        routeHomeName: transformRoutePathToRouteName(import.meta.env.VITE_AUTH_ROUTE_MODE),
        menus: [],
        filteredRoutes: [],
        cacheRoutes: [],
    }),
    actions: {
        /** 重置路由的store **/
        resetRouteStore() {
            this.resetRoutes();
            this.$reset();
        },
        /** 重置路由数据，保存固定路由 */
        resetRoutes() {
            const routes = router.getRoutes();
            routes.forEach(route => {
                const name = route.name || 'root';
                if (!this.isConstantRoute(name)) {
                    router.removeRoute(name)
                }
            });
        },
        /**
         * 是否是固定路由
         * @param name 路由名称
         */
        isConstantRoute(name: string) {
            const constantRouteNames = getConstantRouteNames(constantRouter);
            return constantRouteNames.includes(name);
        },
        /**
         * 是否是有效的固定路由
         * @param name 路由名称
         */
        isValidConstantRoute(name: string) {
            const NOT_FOUND_PAGE_NAME = 'not-found';
            const constantRouteNames = getConstantRouteNames(constantRouter);
            return constantRouteNames.includes(name) && name !== NOT_FOUND_PAGE_NAME;
        },
        /**
         * 处理权限路由
         * @param routes - 权限路由
         */
        handleAuthRoute(routes: RouteRecordRaw[]) {
            (this.menus as MenuOption[]) = transformAuthRouteToMenu(routes);
            (this.filteredRoutes as RouteRecordRaw[]) = routes;

            const vueRoutes = [...routes];

            vueRoutes.forEach(route => {
                router.addRoute(route);
            });

            this.cacheRoutes = getCacheRoutes(vueRoutes);
        },
        /** 动态路由模式下：更新根路由的重定向 **/
        handleUpdateRootRedirect(routeKey: string) {
            if (routeKey === 'root' || routeKey === 'not-found') {
                throw new Error('routeKey的值不能为root或者not-found')
            }
            const rootRoute: RouteRecordRaw = {...RootRoute, redirect: transformRouteNameToRoutePath(routeKey)};
            const rootRouteName = 'root';
            router.removeRoute(rootRouteName);
            const rootVueRoute = transformAuthRouteToVueRoute(rootRoute)[0];
            router.addRoute(rootVueRoute);
        },
        /** 初始化动态路由 **/
        async initDynamicRoute() {
            const {resetAuthStore} = useUser();

            const {id: userId, routes} = storage.get(CURRENT_USER) || null;

            if (!userId) {
                throw new Error('userId 不能为空！');
            }

            if (routes) {
                const userRoutes = JSON.parse(routes);
                this.handleAuthRoute(sortRoutes(userRoutes))
                // home相关处理需要在最后，否则会出现找不到主页404的情况（本来是由后端返回的，这里省事直接就写死了
                this.routeHomeName = transformRoutePathToRouteName(import.meta.env.VITE_AUTH_ROUTE_MODE);
                this.handleUpdateRootRedirect(this.routeHomeName);

                this.isInitAuthRoute = true;
            } else {
                resetAuthStore();
            }
        },
        /** 初始化静态路由 **/
        async initStaticRoute() {
            const auth = useUser();

            const routes = filterAuthRoutesByUserPermission(staticRoutes,  auth.getUserRole as Auth.RoleType);

            this.handleAuthRoute(routes);

            // 标识已初始化用户路由
            this.isInitAuthRoute = true;
        },
        /** 初始化权限路由 **/
        async initAuthRoute() {
            // 插一个getUserInfo
            await useUser().getInfo();

            if (this.authRouteMode === 'dynamic') {
                await this.initDynamicRoute();
            } else {
                await this.initStaticRoute();
            }
        },
        /** 从缓存路由中去除某个路由 **/
        removeCacheRoute(name: string) {
            const index = this.cacheRoutes.indexOf(name);
            if (index !== -1) {
                this.cacheRoutes.splice(index, 1);
            }
        },
        /** 添加某个缓存路由 **/
        addCacheRoute(name: string) {
            const index = this.cacheRoutes.indexOf(name);
            if (index === -1) {
                this.cacheRoutes.push(name);
            }
        },
        /** 重新缓存路由 **/
        async reCacheRoute(name: string) {
            const isCached = this.cacheRoutes.includes(name);

            if (isCached) {
                this.removeCacheRoute(name);
            }

            if (isCached) {
                this.addCacheRoute(name);
            }
        }
    }
});

export function useRoute() {
    return useRouteStore(pinia_store);
}