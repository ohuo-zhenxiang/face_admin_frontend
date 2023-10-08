import { defineConfig, loadEnv } from "vite";
import type { UserConfig, ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  return {
    ssr: { noExternal: ["glob"] },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      extensions: [".js", ".json", ".ts", ".vue"], // 使用路径别名时想要省略的后缀名，可以自己 增减
    },
    server: {
      port: Number(env.VITE_PORT),
      // proxy: {
      //     '/api': {
      //         target: 'http://127.0.0.1:9527',
      //         changeOrigin: true,
      //         rewrite: (path) => path.replace(/^\/api/, '/api/')
      //     }
      // },
    },

    /* more config */
    plugins: [
      vue(),
      AutoImport({
        resolvers: [],
        // 自定引入 Vue VueRouter API,如果还需要其他的可以自行引入
        imports: ["vue", "vue-router"],
        // 调整自动引入的文件位置
        dts: "src/type/auto-import.d.ts",
        // 解决自动引入eslint报错问题 需要在eslintrc的extend选项中引入
        eslintrc: {
          enabled: true,
          // 配置文件的位置
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
      }),
      Components({
        resolvers: [
          // 需要自动导入的组件
          NaiveUiResolver(),
        ],
        dts: "src/type/components.d.ts",
      }),
    ],
  };
});
