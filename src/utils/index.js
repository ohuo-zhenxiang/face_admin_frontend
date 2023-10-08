import { h, unref } from 'vue';
import { NIcon } from 'naive-ui';
import { PageEnum } from "@/enums/pageEnum";
import { cloneDeep } from "lodash-es";
import { isObject } from './is/index';
// render 图标
export function renderIcon(icon) {
    return () => h(NIcon, null, { default: () => h(icon) });
}
export function filterRouter(routerMap) {
    return routerMap.filter((item) => {
        return ((item.meta?.hidden || false) != true && !['/:path(.*)*', '/', PageEnum.BASE_LOGIN].includes(item.path));
    });
}
export const withInstall = (component, alias) => {
    const comp = component;
    comp.install = (app) => {
        app.component(comp.name || comp.displayName, component);
        if (alias) {
            app.config.globalProperties[alias] = component;
        }
    };
    return component;
};
// 判断根路由 Router
export function isRootRouter(item) {
    return (item.meta?.alwaysShow != true && item?.children?.filter((item) => !Boolean(item?.meta?.hidden))?.length === 1);
}
// *  递归组装菜单格式
export function generatorMenu(routerMap) {
    return filterRouter(routerMap).map((item) => {
        const isRoot = isRootRouter(item);
        const info = isRoot ? item.children[0] : item;
        const currentMenu = {
            ...info,
            ...info.meta,
            label: info.meta?.title,
            key: info.name,
            icon: isRoot ? item.meta?.icon : info.meta?.icon,
        };
        // 是否有子菜单，并递归处理
        if (info.children && info.children.length > 0) {
            // Recursion
            currentMenu.children = generatorMenu(info.children);
        }
        return currentMenu;
    });
}
// * 递归组装子菜单
export function getChildrenRouter(routerMap) {
    return filterRouter(routerMap).map((item) => {
        const isRoot = isRootRouter(item);
        const info = isRoot ? item.children[0] : item;
        const currentMenu = {
            ...info,
            ...info.meta,
            label: info.meta?.title,
            key: info.name,
        };
        // 是否有子菜单，并递归处理
        if (info.children && info.children.length > 0) {
            // Recursion
            currentMenu.children = getChildrenRouter(info.children);
        }
        return currentMenu;
    });
}
// * 混合菜单
export function generatorMenuMix(routerMap, routerName, location) {
    const cloneRouterMap = cloneDeep(routerMap);
    const newRouter = filterRouter(cloneRouterMap);
    if (location === 'header') {
        const firstRouter = [];
        newRouter.forEach((item) => {
            const isRoot = isRootRouter(item);
            const info = isRoot ? item.children[0] : item;
            info.children = undefined;
            const currentMenu = {
                ...info,
                ...info.meta,
                label: info.meta?.title,
                key: info.name,
            };
            firstRouter.push(currentMenu);
        });
        return firstRouter;
    }
    else {
        return getChildrenRouter(newRouter.filter((item) => item.name === routerName));
    }
}
export function deepMerge(src = {}, target = {}) {
    let key;
    for (key in target) {
        src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
    }
    return src;
}
/*判断是否 url*/
export function isUrl(url) {
    return /^(http|https):\/\//g.test(url);
}
// dynamic use hook props
export function getDynamicProps(props) {
    const ret = {};
    Object.keys(props).map((key) => {
        ret[key] = unref(props[key]);
    });
    return ret;
}
//# sourceMappingURL=index.js.map