import { Layout } from "@/router/constant";
import { DashboardOutlined } from "@vicons/antd";
import { renderIcon } from '@/utils';
const routeName = "dashboard";
/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 * */
const routes = [
    {
        path: "/dashboard",
        name: routeName,
        redirect: "/dashboard/overview",
        component: Layout,
        meta: {
            title: "仪表盘",
            icon: renderIcon(DashboardOutlined),
            permissions: ["dashboard_console", "dashboard_workplace"],
            sort: 0,
        },
        children: [
            {
                path: "overview",
                name: `${routeName}_overview`,
                meta: {
                    title: "系统总览",
                    permissions: ["dashboard_overview"],
                    affix: true,
                },
                component: () => import("@/views/dashboard/overview/overview.vue"),
            },
            // {
            //   path: "workplace",
            //   name: `${routeName}_workplace`,
            //   meta: {
            //     title: "统计分析",
            //     keepAlive: true,
            //     permission: ["dashboard_workplace"],
            //   },
            //   component: () => import("@/views/dashboard/workplace/workplace.vue"),
            // },
        ],
    },
];
export default routes;
//# sourceMappingURL=dashboard.js.map