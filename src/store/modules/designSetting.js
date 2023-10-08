import { defineStore } from "pinia";
import { pinia_store } from "@/store";
import designSetting from "@/settings/designSetting";
const { darkTheme, appTheme, appThemeList } = designSetting;
export const useDesignSettingStore = defineStore({
    id: 'app-design-setting',
    state: () => ({
        darkTheme,
        appTheme,
        appThemeList,
    }),
    getters: {
        getDarkTheme() {
            return this.darkTheme;
        },
        getAppTheme() {
            return this.appTheme;
        },
        getAppThemeList() {
            return this.appThemeList;
        },
    },
    actions: {}
});
export function useDesignSetting() {
    return useDesignSettingStore(pinia_store);
}
//# sourceMappingURL=designSetting.js.map