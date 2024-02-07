import {UnorderedListOutlined} from '@vicons/antd';
import {renderIcon} from "@/utils";
import {Layout} from '@/router/constant';
import {RouteRecordRaw} from "vue-router";


/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 *
 * */

const routes: Array<RouteRecordRaw> = [
    {
        path: "/TaskManage",
        name: 'TaskManage',
        // redirect: '/regTask/task-manage',
        component: Layout,
        meta: {
            title: "任务管理",
            icon: renderIcon(UnorderedListOutlined),
            sort: 3,
        },
        children: [
            {
                path: 'face-task',
                name: 'face-task',
                meta: {
                    title: '人脸识别任务',
                },
                component: () => import('@/views/taskManage/facetaskManage.vue'),
            },
            {
                path: 'face-record/:token?',
                name: 'face-record',
                meta: {
                    title: '人脸识别记录',
                    hideBreadcrumb: true,
                    hidden: true,
                    activeMenu: 'face-task',
                    dynamicPath: true,
                },
                component: () => import('@/views/taskManage/facetaskRecord.vue')
            },
            {
                path: 'human-task',
                name: 'human-task',
                meta: {
                    title: '人体检测任务',
                },
                component: () => import('@/views/taskManage/humanTaskManage.vue')
            },
            {
                path: 'human-record/:token?',
                name: 'human-record',
                meta: {
                    title: '人体检测记录',
                    hidden: true,
                    hideBreadcrumb: true,
                    activeMenu: 'human-task',
                    dynamicPath: true,
                },
                component: () => import('@/views/taskManage/humanTaskRecord.vue')
            }
        ]
    },
];

export default routes;