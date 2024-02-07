import {RouteRecordRaw} from "vue-router";

declare namespace AuthRoute {
    /** 根路由路径 */
    type RootRoutePath = '/';

    /** 捕获无效路由的路由路径 **/
    type NotFoundRoutePath = '/:pathMatch(.*)*';

    type RootRouteKey = 'root';

    type NotFoundRouteKey = 'not-found';

    /** 前端导入的路由模块**/
    type RouteModule = Record<string, {default: RouteRecordRaw}>

    /**
     * 路由的组件
     * - basic - 基础布局、具有公共部分的布局
     * - blank - 空白布局
     * - multi - 多级路由布局（三级路由或三级以上时，除第一级路由和最后一级路由，其余的采用该布局）
     * - self - 作为子路由，使用自身的布局(作为最后一集路由，没有子路由）
     */
    type RouteComponentType = 'basic' | 'blank' | 'multi' | 'self';

    /**
     * last degree route key，which has the page file
     */
    type LastDegreeRouteKey = Extract<
        | '403'
        | '404'
        | '500'
        | 'login'
        | 'not-found'
        | 'overview'
        | 'management'
        | 'snapShots'
        | 'basic-group'
        | 'face-task'
        | 'human-task'
        | 'basic-camera'
    >;
}