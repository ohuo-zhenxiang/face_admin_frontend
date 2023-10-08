import { computed, unref, ref } from 'vue';
import { isBoolean } from '@/utils/is';
import { APISETTING, DEFAULTPAGESIZE, PAGESIZES } from '../const';
export function usePagination(refProps) {
    const configRef = ref({});
    const show = ref(true);
    const getPaginationInfo = computed(() => {
        const { pagination } = unref(refProps);
        if (!unref(show) || (isBoolean(pagination) && !pagination)) {
            return false;
        }
        const { totalField } = APISETTING;
        return {
            pageSize: DEFAULTPAGESIZE,
            pageSizes: PAGESIZES,
            showSizePicker: true,
            showQuickJumper: true,
            ...(isBoolean(pagination) ? {} : pagination),
            ...unref(configRef),
            pageCount: unref(configRef)[totalField],
        };
    });
    function setPagination(info) {
        const paginationInfo = unref(getPaginationInfo);
        configRef.value = {
            ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
            ...info,
        };
    }
    function getPagination() {
        return unref(getPaginationInfo);
    }
    function getShowPagination() {
        return unref(show);
    }
    async function setShowPagination(flag) {
        show.value = flag;
    }
    return { getPagination, getPaginationInfo, setShowPagination, getShowPagination, setPagination };
}
//# sourceMappingURL=usePagination.js.map