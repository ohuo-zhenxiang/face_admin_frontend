import {defineStore} from "pinia";
import projectSetting from '@/settings/projectSetting';
import type {IHeaderSetting, IMenuSetting, IMultiTabsSetting, ICrumbsSetting} from "@/types/config";

const {
    navMode,
    navTheme,
    isMobile,
    headerSetting,
    showFooter,
    multiTabsSetting,
    menuSetting,
    crumbsSetting,
    permissionMode,
    isPageAnimate,
    pageAnimateType
} = projectSetting;

interface ProjectSettingState {
    navMode: string;
    navTheme: string;
    headerSetting: IHeaderSetting; // 顶部设置
    showFooter: boolean;
    menuSetting: IMenuSetting;  // 多标签
    multiTabsSetting: IMultiTabsSetting;  // 多标签
    crumbsSetting: ICrumbsSetting;  // 面包屑
    permissionMode: string;  // 权限模式
    isPageAnimate: boolean;  // 是否开启路由动画
    pageAnimateType: string;
    isMobile: boolean;
}

export const useProjectSettingStore = defineStore({
    id: 'app-project-setting',
    state: ():ProjectSettingState => ({
        navMode: navMode,
        navTheme: navTheme,
        isMobile: isMobile,
        headerSetting: headerSetting,
        showFooter: showFooter,
        menuSetting,
        multiTabsSetting,
        crumbsSetting,
        permissionMode,
        isPageAnimate,
        pageAnimateType,
    }),
    getters: {
        getNavMode(): string {
            return this.navMode;
        },
        getNavTheme(): string {
            return this.navTheme;
        },
        getIsMobile(): boolean {
            return this.isMobile;
        },
        getHeaderSetting(): object {
            return this.headerSetting;
        },
        getShowFooter(): boolean {
            return this.showFooter;
        },
        getMenuSetting(): object {
            return this.menuSetting;
        },
        getMultiTabsSetting(): object {
            return this.multiTabsSetting;
        },
        getPermissionMode(): string {
            return this.permissionMode;
        },
        getIsPageAnimate(): boolean {
            return this.isPageAnimate;
        },
        getPageAnimateType(): string {
            return this.pageAnimateType;
        },
    },
    actions: {
        setNavTheme(value: string): void {
            this.navTheme = value;
        },
        setIsMobile(value: boolean): void {
            this.isMobile = value;
        },
    },
});