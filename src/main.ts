import "./styles/tailwind.css";
import { createApp } from "vue";
import VueKonva from "vue-konva";

import App from "./App.vue";
import router, { setupRouter } from "@/router";
import { setupPStore } from "@/store";

async function bootstrap() {
  const app = createApp(App);

  // 挂载状态管理
  setupPStore(app);



  // 挂载路由
  setupRouter(app);

  // 路由准备就绪后挂载 APP 实例
  // https://router.vuejs.org/api/interfaces/router.html#isready
  await router.isReady();

  const meta = document.createElement("meta");
  meta.name = "naive-ui-style";
  document.head.appendChild(meta);

  // 挂载 Konva
  app.use(VueKonva);

  app.mount("#app", true);
}

void bootstrap();
