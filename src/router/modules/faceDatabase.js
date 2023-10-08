import { FolderTwotone } from '@vicons/antd';
import { renderIcon } from "@/utils";
import { Layout } from '@/router/constant';
const routeName = "FaceDatabase";
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
        path: "/faceDatabase",
        name: routeName,
        component: Layout,
        redirect: '/faceDatabase/management',
        meta: {
            title: "人脸仓库",
            icon: renderIcon(FolderTwotone),
            sort: 1,
        },
        children: [
            {
                path: 'management',
                name: 'management',
                meta: {
                    title: '人脸管理'
                },
                component: () => import('@/views/faceDatabase/faceTable.vue'),
            },
            {
                path: 'snapShots',
                name: 'snapShots',
                meta: {
                    title: '抓拍导入',
                },
                component: () => import('@/views/faceDatabase/snapShots.vue'),
            },
        ],
    },
];
export default routes;
//# sourceMappingURL=faceDatabase.js.map