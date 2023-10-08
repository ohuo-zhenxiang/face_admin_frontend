import { defineStore } from "pinia";
import projectSetting from '@/settings/projectSetting';
const { navMode, navTheme, isMobile, headerSetting, showFooter, multiTabsSetting, menuSetting, crumbsSetting, permissionMode, isPageAnimate, pageAnimateType } = projectSetting;
export const useProjectSettingStore = defineStore({
    id: 'app-project-setting',
    state: () => ({
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
        getNavMode() {
            return this.navMode;
        },
        getNavTheme() {
            return this.navTheme;
        },
        getIsMobile() {
            return this.isMobile;
        },
        getHeaderSetting() {
            return this.headerSetting;
        },
        getShowFooter() {
            return this.showFooter;
        },
        getMenuSetting() {
            return this.menuSetting;
        },
        getMultiTabsSetting() {
            return this.multiTabsSetting;
        },
        getPermissionMode() {
            return this.permissionMode;
        },
        getIsPageAnimate() {
            return this.isPageAnimate;
        },
        getPageAnimateType() {
            return this.pageAnimateType;
        },
    },
    actions: {
        setNavTheme(value) {
            this.navTheme = value;
        },
        setIsMobile(value) {
            this.isMobile = value;
        },
    },
});
//# sourceMappingURL=projectSetting.js.map