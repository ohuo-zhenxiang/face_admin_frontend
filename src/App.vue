<template>
  <NConfigProvider :locale="zhCN" :theme="lightTheme" :date-locale="dateZhCN">
    <!--  用来全局响应样式  -->
    <NGlobalStyle />
    <!--    <n-global-style />-->
    <AppProvider>
      <RouterView />
    </AppProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { AppProvider } from "@/components/Application";
import { dateZhCN, zhCN, lightTheme} from "naive-ui";
</script>

<style lang="less">
@import "styles/index";
</style>
