import { toRaw} from "vue";
import { defineStore } from "pinia";
import { RouteRecordRaw } from "vue-router";
import { pinia_store } from "@/store";
import { asyncRoutes, constantRouter } from "@/router";
import {generateDynamicRoutes} from '@/router/generator';
import {useProjectSetting} from '@/hooks/setting/useProjectSetting'

interface TreeHelperConfig {
  id: string;
  children: string;
  pid: string;
}

const DEFAULT_CONFIG: TreeHelperConfig = {
  id: "id",
  children: "children",
  pid: "pid",
};

const getConfig = (config: Partial<TreeHelperConfig>) =>
  Object.assign({}, DEFAULT_CONFIG, config);

export interface IAsyncRouteState {
  menus: RouteRecordRaw[];
  routers: any[];
  routersAdded: any[];
  keepAliveComponents: string[];
  isDynamicRouteAdded: boolean;
}

// @ts-ignore
function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config);
  const children = config.children as string;

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children]);
        return func(node) || (node[children] && node[children].length);
      });
  }
  return listFilter(tree);
}

export const useAsyncRouteStore = defineStore({
  id: "app-async-route",
  state: (): IAsyncRouteState => ({
    menus: asyncRoutes,    // 先暂时这么用全部路由都加进去，后面加权限功能再搞这个
    routers: constantRouter,
    routersAdded: [],
    keepAliveComponents: [],
    // whether the route has been dynamically added
    isDynamicRouteAdded: false,
  }),
  getters: {
    getMenus(): RouteRecordRaw[] {
      return this.menus;
    },
    getIsDynamicRouteAdded(): boolean {
      return this.isDynamicRouteAdded;
    },
  },
  actions: {
    getRouters() {
      return toRaw(this.routersAdded);
    },
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added;
    },
    //设置动态路由
    setRouters(routers: RouteRecordRaw[]) {
      this.routersAdded = routers;
      this.routers = constantRouter.concat(routers);
    },
    setMenus(menus: RouteRecordRaw[]) {
      // 设置动态路由
      this.menus = menus;
    },
    setKeepAliveComponents(compNames: string[]) {
      // 设置需要缓存的组件
      this.keepAliveComponents = compNames;
    },
    async generateRoutes(data: any) {
      let accessedRouters;
      const permissionList = JSON.parse(data.routes) ?? [];
      const routeFilter = (route) => {
        const { meta } = route;
        const { permissions } = meta || {};
        if (!permissions) return true;
        return permissionList.some((item) => permissions.includes(item.value));
      };
      console.log('asyncRoutes', asyncRoutes)
      const {permissionMode} = useProjectSetting();
      if (unref(permissionMode) === 'BACK') {
        // 动态获取菜单(暂时采用静态的）
        accessedRouters = filter(asyncRoutes, routeFilter)
      } else {
        try {
          // 过滤账户是否拥有某一个权限，并将菜单从加载列表中移除
          accessedRouters = asyncRoutes;
        } catch (error) {
          console.log('generateRoutes', error)
        }
      }

      console.log('asyncRoute', accessedRouters)
      accessedRouters = accessedRouters.filter(routeFilter);
      this.setRouters(asyncRoutes);

      this.setMenus(asyncRoutes);
      return toRaw(accessedRouters);
    },
  },
});

export function useAsyncRoute() {
  return useAsyncRouteStore(pinia_store);
}
