import {defineStore} from "pinia";
import {pinia_store} from "@/store";
import designSetting from "@/settings/designSetting";

const {darkTheme, appTheme, appThemeList} = designSetting;

interface DesignSettingState {
    // 深色主题
    darkTheme: boolean;
    // 系统风格
    appTheme: string;
    // 系统内置风格
    appThemeList: string[];
}

export const useDesignSettingStore = defineStore({
    id: 'app-design-setting',
    state: (): DesignSettingState => ({
        darkTheme,
        appTheme,
        appThemeList,
    }),
    getters: {
        getDarkTheme(): boolean {
            return this.darkTheme;
        },
        getAppTheme(): string {
            return this.appTheme;
        },
        getAppThemeList(): string[] {
            return this.appThemeList;
        },
    },
    actions: {}
});

export function useDesignSetting(){
    return useDesignSettingStore(pinia_store)
}