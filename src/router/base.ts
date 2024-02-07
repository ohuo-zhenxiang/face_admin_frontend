import {ErrorPage, RedirectName, Layout} from "@/router/constant";
import {RouteRecordRaw} from 'vue-router';

// 404 on a page
export const NotFoundRoute: RouteRecordRaw = {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: Layout,
    meta: {
        title: '未找到',
        hideBreadcrumb: true,
    }
};

export const ErrorPageRoute: RouteRecordRaw[] = [
    {
        name: '404',
        path: '/404',
        component: ErrorPage,
        meta: {
            title: '未找到'
        }
    }
]

export const RedirectRoute: RouteRecordRaw = {
    path: '/redirect',
    name: RedirectName,
    component: Layout,
    meta: {
        title: RedirectName,
        hideBreadcrumb: true,
    },
    children: [
        {
            path: '/redirect/:path(.*)',
            name: RedirectName,
            component: () => import('@/views/redirect/index.vue'),
            meta: {
                title: RedirectName,
                hideBreadcrumb: true,
            }
        }
    ]
}