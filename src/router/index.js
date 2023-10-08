import { createRouter, createWebHistory, } from "vue-router";
import { PageEnum } from "@/enums/pageEnum";
// import { RedirectName } from "@/router/constant";
const modules = import.meta.glob("./modules/**/*.ts", {
    eager: true,
});
const routeModuleList = Object.keys(modules).reduce((list, key) => {
    const mod = modules[key].default ?? {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    return [...list, ...modList];
}, []);
function sortRoute(a, b) {
    return (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0);
}
routeModuleList.sort(sortRoute);
export const RootRoute = {
    path: "/",
    name: "Root",
    redirect: PageEnum.BASE_HOME,
    meta: {
        title: "Root",
    },
};
export const LoginRoute = {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
        title: "登录",
    },
};
// 需要验证权限的路由
export const asyncRoutes = [...routeModuleList];
// 普通路由，无需权限验证
export const constantRouter = [
    LoginRoute,
    RootRoute,
    ...routeModuleList,
];
const router = createRouter({
    history: createWebHistory(),
    routes: constantRouter,
    strict: true,
    scrollBehavior: () => ({ left: 0, top: 0 }),
});
export function setupRouter(app) {
    app.use(router);
    // 创建路由守卫
}
export default router;
//# sourceMappingURL=index.js.map