import {App} from "vue";
import {
    createRouter,
    createWebHistory,
    Router,
    RouteRecordRaw,
} from "vue-router";
import {RedirectRoute, NotFoundRoute, ErrorPageRoute} from '@/router/base';
import {PageEnum} from "@/enums/pageEnum";
import type {IModuleType} from "./types";
// import {createRouterGuards} from './guard';
import {createRouterGuard} from './guard/index.ts';

const modules = import.meta.glob<IModuleType>("./modules/**/*.ts", {
    eager: true,
});

// 通过获取./modules下的所有ts文件，并将其转换为RouteRecordRaw路由列表
export const routeModuleList: RouteRecordRaw[] = Object.keys(modules).reduce((list, key) => {
    const mod = modules[key].default ?? {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    return [...list, ...modList].sort(sortRoute);
}, []);

function sortRoute(a: RouteRecordRaw, b: RouteRecordRaw) {
    return (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0);
}

// routeModuleList.sort(sortRoute);

export const RootRoute: RouteRecordRaw = {
    path: "/",
    name: "Root",
    redirect: PageEnum.BASE_HOME, // dashboard
    meta: {
        title: "Root",
    },
};

export const LoginRoute: RouteRecordRaw = {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
        title: "登录",
    },
};

// 需要验证权限的路由
export const asyncRoutes = [...routeModuleList];
// console.log('需要验权的路由', asyncRoutes)

// 固定路由，无需权限验证
export const constantRouter: RouteRecordRaw[] = [
    LoginRoute,
    RootRoute,
    RedirectRoute,
    NotFoundRoute,
    ...ErrorPageRoute,
];
// console.log('固定路由，无需权限验证', constantRouter)

export const router: Router = createRouter({
    history: createWebHistory(),
    routes: constantRouter,
    strict: true,
    scrollBehavior: () => ({left: 0, top: 0}),
});

export function setupRouter(app: App) {
    app.use(router);
    // 创建路由守卫
    // createRouterGuards(router);
    createRouterGuard(router);
}

export default router;
