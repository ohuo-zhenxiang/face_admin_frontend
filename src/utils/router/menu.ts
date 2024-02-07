import {RouteRecordRaw} from "vue-router";
import {MenuOption} from 'naive-ui';

/**
 * 将权限路由转换成菜单
 * @param routes - 路由
 */
export function transformAuthRouteToMenu(routes: RouteRecordRaw[]): MenuOption[] {
    const globalMenu: MenuOption[] = [];
    routes.forEach(route => {
        const {name, path, meta} = route;
        const routeName = name as string;
        let menuChildren: MenuOption[] | undefined;
        if (route.children && route.children.length > 0) {
            menuChildren = transformAuthRouteToMenu(route.children);
        }
        const menuItem: MenuOption = addPartialProps({
            menu: {
                key: routeName,
                label: meta.title | null,
                routeName: routeName,
                routePath: path,
            },
            icon: meta.icon,
            children: menuChildren,
        });

        if (!hideInMenu(route)) {
            globalMenu.push(menuItem);
        }
    });

    return globalMenu;
}

/**
 * 获取当前路由所在菜单数据的paths
 * @param activeKey - 当前路由的key
 * @param menus - 菜单数据
 */
export function getActiveMenuPathsOfMenus(activeKey: string, menus: MenuOption[]) {
    const keys: string[] = [];
    const lists: MenuOption[] = [];

    function traverse(list: MenuOption[], parent: MenuOption | null) {
        list.forEach((item: MenuOption) => {
            lists.push(item);
            if (parent) {
                item.parent = parent;
            }
            if (item.children) {
                traverse(item.children, item);
            }
        });
    }

    traverse(JSON.parse(JSON.stringify(menus)));
    lists.forEach((item: MenuOption) => {
        if (item.routeName === activeKey) {
            let temp = item;
            while (temp) {
                keys.push(temp.routeName);
                temp = temp.parent as MenuOption;
            }
        }
    });
    return keys;
}

/** 路由不转换菜单 **/
function hideInMenu(route: RouteRecordRaw) {
    return Boolean(route.meta.hide);
}


/** 给菜单添加可选属性 **/
function addPartialProps(config: {
    menu: MenuOption[];
    icon?: string;
    localIcon?: string;
    children?: MenuOption[];
}) {
    const item = {...config.menu};

    const {icon, localIcon, children} = config;

    if (localIcon) {
        Object.assign(item, {icon: localIcon});
    }

    if (icon) {
        Object.assign(item, {icon: icon});
    }

    if (children) {
        Object.assign(item, {children});
    }

    return item;
}
