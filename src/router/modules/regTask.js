import { UnorderedListOutlined } from '@vicons/antd';
import { renderIcon } from "@/utils";
import { Layout } from '@/router/constant';
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
const routes = [
    {
        path: "/regTask",
        name: 'RegTask',
        redirect: '/regTask/task-manage',
        component: Layout,
        meta: {
            icon: renderIcon(UnorderedListOutlined),
            sort: 3,
        },
        children: [
            {
                path: 'task-manage',
                name: 'task-manage',
                meta: {
                    title: '任务管理',
                },
                component: () => import('@/views/taskManage/taskManage.vue'),
            },
            {
                path: 'task-record/:token?',
                name: 'task-record',
                meta: {
                    title: '任务记录',
                    hidden: true,
                    activeMenu: 'task-manage',
                },
                component: () => import('@/views/taskManage/taskRecord.vue')
            }
        ]
    },
];
export default routes;
//# sourceMappingURL=regTask.js.map