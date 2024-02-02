import type { RouteRecordRaw } from 'vue-router';
import {isNavigationFailure, Router} from 'vue-router';
import {useUser} from '@/store/modules/user';
import {useAsyncRoute} from "@/store/modules/asyncRoute";
import {ACCESS_TOKEN} from '@/store/mutation-types';
import {storage} from "@/utils/Storage";
import {PageEnum} from '@/enums/pageEnum';
import {ErrorPageRoute} from '@/router/base';

const LOGIN_PATH = PageEnum.BASE_LOGIN;

const whitePathList = [LOGIN_PATH];  // no redirect whitelist

export function createRouterGuards(router: Router) {
    const userStore = useUser();
    const asyncRouteStore = useAsyncRoute();
    router.beforeEach(async (to, from, next) => {
        const Loading = window['$loading'] || null;
        Loading && Loading.start();
        if (from.path === LOGIN_PATH && to.name === 'errorPage') {
            // from login to error-page, then redirect to the home-page
            next(PageEnum.BASE_HOME);
            return;
        }

        // 目标路径在白名单中，直接放行
        if (whitePathList.includes(to.path as PageEnum)) {
            next();
            return;
        }

        const token = storage.get(ACCESS_TOKEN);

        if (!token) {
            // 要是目标路由的meta设置
            // ignoreAuth: true，则直接放行
            if (to.meta.ignoreAuth) {
                next();
                return;
            }
            // redirect login-page
            const redirectData: {path: string; replace: boolean; query?: Recordable<string>} = {
                path: LOGIN_PATH,
                replace: true,
            };
            if (to.path) {
                redirectData.query = {
                    ...redirectData.query,
                    redirect: to.path,
                };
            }
            next(redirectData);
            return;
        }

        if (asyncRouteStore.getIsDynamicRouteAdded) {
            next();
            return;
        }

        const userInfo = await userStore.getInfo();

        const routes = await asyncRouteStore.generateRoutes(userInfo);

        // 动态访问可添加路由表
        routes.forEach((item)=>{
            router.addRoute(item as unknown as RouteRecordRaw);
        });
        console.log(routes)

        // 添加404
        const isErrorPage = router.getRoutes().findIndex((item) => item.name === ErrorPageRoute.name);
        if (isErrorPage === -1) {
            router.addRoute(ErrorPageRoute as unknown as RouteRecordRaw);
        }

        const redirectPath = (from.query.redirect || to.path) as string;
        const redirect = decodeURIComponent(redirectPath);
        const nextData = to.path === redirect ? {...to, replace: true} : {path: redirect};
        asyncRouteStore.setDynamicRouteAdded(true);
        next(nextData);
        Loading && Loading.finish();
    });

    router.afterEach((to, _, failure) => {
        document.title = (to?.meta?.title as string) || document.title;
        if (isNavigationFailure(failure)) {
            // console.log('failed navigation', failure);
        }
        const asyncRouteStore = useAsyncRoute();
        // 在这里设置需要缓存的组件名称
        const keepAliveComponents = asyncRouteStore.keepAliveComponents;
        const currentComName: any = to.matched.find((item)=>item.name == to.name)?.name;
        if (currentComName && !keepAliveComponents.includes(currentComName) && to.meta?.keepAlive) {
            // 需要缓存的组件
            keepAliveComponents.push(currentComName);
        } else if (!to.meta?.keepAlive || to.name == 'Redirect') {
            // 不需要缓存的组件
            const index = asyncRouteStore.keepAliveComponents.findIndex((name) => name == currentComName);
            if (index != -1) {
                keepAliveComponents.splice(index, 1);
            }
        }
        asyncRouteStore.setKeepAliveComponents(keepAliveComponents);
        const Loading = window['$loading'] || null;
        Loading && Loading.finish();
    });

    router.onError((error)=>{
        console.log(error, '路由错误')
    })
}

