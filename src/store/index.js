import { createPinia } from "pinia";
const pinia_store = createPinia();
export function setupPStore(app) {
    app.use(pinia_store);
}
export { pinia_store };
//# sourceMappingURL=index.js.map