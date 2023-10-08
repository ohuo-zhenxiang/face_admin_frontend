import { provide, inject } from 'vue';
const key = Symbol('s-table');
export function createTableContext(instance) {
    provide(key, instance);
}
export function useTableContext() {
    return inject(key);
}
//# sourceMappingURL=useTableContext.js.map