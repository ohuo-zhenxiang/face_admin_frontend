import {h, unref} from 'vue';
import type {App, Plugin, Component} from 'vue';
import {NIcon} from 'naive-ui';
import {PageEnum} from "@/enums/pageEnum";
import {cloneDeep} from "lodash-es";
import {isObject} from './is/index';
import {Recordable} from "vite-plugin-mock";

// render 图标
export function renderIcon(icon) {
    return () => h(NIcon, null, {default: () => h(icon)});
}

export function filterRouter(routerMap: Array<any>) {
    return routerMap.filter((item) => {
        return (
            (item.meta?.hidden || false) != true && !['/:path(.*)*', '/', PageEnum.BASE_LOGIN].includes(item.path)
        );
    });
}

export const withInstall = <T extends Component>(component: T, alias?: string) => {
    const comp = component as any;
    comp.install = (app: App) => {
        app.component(comp.name || comp.displayName, component);
        if (alias) {
            app.config.globalProperties[alias] = component;
        }
    };
    return component as T & Plugin;
};


// 判断根路由 Router
export function isRootRouter(item) {
    return (
        item.meta?.alwaysShow != true && item?.children?.filter((item) => !Boolean(item?.meta?.hidden))?.length === 1
    );
}


// *  递归组装菜单格式
export function generatorMenu(routerMap: Array<any>) {
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
    })
}

// * 递归组装子菜单
export function getChildrenRouter(routerMap: Array<any>) {
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
    })
}


// * 混合菜单
export function generatorMenuMix(routerMap: Array<any>, routerName: string, location: string) {
    const cloneRouterMap = cloneDeep(routerMap);
    const newRouter = filterRouter(cloneRouterMap);
    if (location === 'header') {
        const firstRouter: any[] = [];
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
        })
        return firstRouter;
    } else {
        return getChildrenRouter(newRouter.filter((item) => item.name === routerName));
    }
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
    let key: string;
    for (key in target) {
        src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
    }
    return src
}

/*判断是否 url*/
export function isUrl(url: string) {
    return /^(http|https):\/\//g.test(url);
}

// dynamic use hook props
export function getDynamicProps<T extends {}, U>(props: T): Partial<U> {
    const ret: Recordable = {};

    Object.keys(props).map((key) => {
        ret[key] = unref((props as Recordable)[key]);
    });

    return ret as Partial<U>;
}


/**
 * Sums the passed percentage to the R, G or B of a HEX color
 * @param {string} color - The color to change
 * @param {number} amount - The amount to change the color by
 * @returns {string} The processed part of the color
 */
function addLight(color: string, amount: number) {
    const cc = parseInt(color, 16) + amount;
    const c = cc > 255 ? 255 : cc;
    return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}


/**
 * Lightens a 6 char HEX color according to the passed percentage
 * @param {string} color - The color to change
 * @param {number} amount - The amount to change the color by
 * @returns {string} The processed color represented as HEX
 */
export function lighten(color: string, amount: number) {
    color = color.indexOf('#') >= 0 ? color.substring(1, color.length) : color;
    amount = Math.trunc((255 * amount) / 100);
    return `#${addLight(color.substring(0, 2), amount)}${addLight(
        color.substring(2, 4),
        amount
    )}${addLight(color.substring(4, 6), amount)}`;
}
