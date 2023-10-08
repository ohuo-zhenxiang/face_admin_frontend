import {computed} from "vue";
import {useProjectSettingStore} from "@/store/modules/projectSetting";

export function useProjectSetting() {
    const projectStore = useProjectSettingStore();

    const navMode = computed(() => projectStore.navMode);

    const navTheme = computed(() => projectStore.navTheme);

    const isMobile = computed(() => projectStore.isMobile);

    const headerSetting = computed(() => projectStore.headerSetting);

    const showFooter = computed(() => projectStore.showFooter);

    const menuSetting = computed(() => projectStore.menuSetting);

    const multiTabsSetting = computed(() => projectStore.multiTabsSetting);

    const crumbsSetting = computed(() => projectStore.crumbsSetting);

    const permissionMode = computed(() => projectStore.permissionMode);

    const isPageAnimate = computed(() => projectStore.pageAnimateType);

    return {
        navMode,
        navTheme,
        isMobile,
        headerSetting,
        showFooter,
        menuSetting,
        multiTabsSetting,
        crumbsSetting,
        permissionMode,
        isPageAnimate
    };
}