import type { App } from "vue";
import { createPinia } from "pinia";

const pinia_store = createPinia();

export function setupPStore(app: App<Element>) {
  app.use(pinia_store);
}

export { pinia_store };
