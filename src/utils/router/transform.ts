import type {RouteRecordRaw} from 'vue-router';
import {getLayoutComponent, getViewComponent} from './component';
import {AuthRoute} from "@/types/route";

/**
 * 将权限路由转换为vue路由
 * @param routes - 权限路由
 * @description 所有多级路由都会被转换成二级路由
 */
export function transformAuthRouteToVueRoutes(routes: RouteRecordRaw[]) {
    return routes.map(route => transformAuthRouteToVueRoute(route)).flat(1);
}

type ComponentAction = Record<AuthRoute.RouteComponentType, () => void>;

/**
 * 将单个权限路由转换为vue路由
 * @param item - 单个权限路由
 */
export function transformAuthRouteToVueRoute(item: RouteRecordRaw) {
    const resultRoute: RouteRecordRaw[] = [];

    const itemRoute = {...item} as RouteRecordRaw;

    // 动态path
    if (hasDynamicPath(item)) {
        Object.assign(itemRoute, {path: item.meta?.dynamicPath});
    }

    // 路由组件
    if (hasComponent(item)) {
        const action: ComponentAction = {
            basic() {
                itemRoute.component = getLayoutComponent('basic');
            },
            blank() {
                itemRoute.component = getLayoutComponent('blank');
            },
            multi() {
                // 多级路由一定有子路由
                if (hasChildren(item)) {
                    Object.assign(itemRoute, {meta: {...itemRoute.meta, multi: true}});
                    delete itemRoute.component;
                } else {
                    window.console.error('多级路由缺少子路由：', item);
                }
            },
            self() {
                itemRoute.component = getViewComponent(item.name as string)
            }
        };
        console.log(item.component)

        try {
            if (item.component) {
                action[item.component]();
            } else {
                window.console.error('路由组件解析失败：', item);
            }
        } catch {
            window.console.error('路由组件解析失败：', item)
        }
    }

    // 注意：单独路由没有children
    if (isSingleRoute(item)) {
        if (hasChildren(item)) {
            window.console.error('单独路由不应该有子路由: ', item);
        }

        // 捕获无效路由的需特殊处理
        if (item.name === 'not-found') {
            itemRoute.children = [
                {
                    path: '',
                    name: item.name,
                    component: getViewComponent('not-found')
                }
            ];
        } else {
            const parentPath = `${itemRoute.path}_parent`

            const layout = item.meta.singleLayout === 'basic' ? getLayoutComponent('basic') : getLayoutComponent('blank');

            const parentRoute: RouteRecordRaw = {
                path: parentPath,
                component: layout,
                redirect: item.path,
                children: [itemRoute],
            };

            return [parentRoute];
        }
    }

    // 子路由
    if (hasChildren(item)) {

        const children = (item.children as RouteRecordRaw[]).map(child => transformAuthRouteToVueRoute(child)).flat();
        console.log(children)

        children.forEach(child => {
            child.path = itemRoute.path + '/' + child.path
        })

        console.log(children)

        // 找出第一个部位多级路由中间级的子路由作为重定向路径
        const redirectPath = (children.find(v => !v.meta?.multi)?.path || '/') as string;

        if (redirectPath === '/') {
            window.console.error('该多级路由没有有效的子路由', item);
        }

        if (item.component === 'multi') {
            // 多级路由，将子路由提取出来变成同级
            resultRoute.push(...children);
            delete itemRoute.children;
        } else {
            itemRoute.children = children;
        }
        itemRoute.redirect = redirectPath;
    }

    resultRoute.push(itemRoute);

    return resultRoute;
}


/** 将路由名字转换成路由路径 **/
export function transformRouteNameToRoutePath(name: string) {
    const rootPath = '/';
    if (name === 'root') return rootPath;

    const splitMark = '_';
    const pathSplitMark = '/';
    const path = name.split(splitMark).join(pathSplitMark);

    return pathSplitMark + path;
}


/** 将路由路径转换为路由名字 **/
export function transformRoutePathToRouteName(path: string) {
    if (path === '/') return 'root';

    const pathSplitMark = '/';
    const routeSplitMark = '_';

    const name = path.split(pathSplitMark).slice(1).join(routeSplitMark);

    return name;
}


/**
 * 是否有外链
 * @param item - 权限路由
 */
function hasHref(item: RouteRecordRaw) {
    return Boolean(item.meta.href);
}


/**
 * 是否有动态路由path
 * @param item - 权限路由
 */
function hasDynamicPath(item: RouteRecordRaw) {
    return Boolean(item.meta.dynamicPath);
}


/**
 * 是否有路由组件
 * @param item - 权限路由
 */
function hasComponent(item: RouteRecordRaw) {
    return Boolean(item.component);
}


/**
 * 是否有子路由
 * @param item - 权限路由
 */
function hasChildren(item: RouteRecordRaw) {
    return Boolean(item.children && item.children.length);
}


/**
 * 是否是单层次路由
 * @param item - 权限路由
 */
function isSingleRoute(item: RouteRecordRaw) {
    return Boolean(item.meta.singleLayout);
}
