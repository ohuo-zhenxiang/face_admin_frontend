import {PeopleTeam28Regular} from '@vicons/fluent';
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
        path: "/personGroup",
        name: 'PersonGroup',
        redirect: '/personGroup/basic-group',
        component: Layout,
        meta: {
            icon: renderIcon(PeopleTeam28Regular),
            sort: 2,
        },
        children: [
            {
                path: 'basic-group',
                name: 'basic-group',
                meta: {
                    title: '人脸分组'
                },
                component: () => import('@/views/faceGroup/index.vue'),
            },
        ],
    },
];

export default routes;