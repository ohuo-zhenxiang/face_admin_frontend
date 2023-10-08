<template>
  <RouterView>
    <!-- 动态缓存路由组件，暂时不用？？？-->
    <!--    <template #default="{Component, route}">-->
    <!--      <transition :name="getTransitionName" mode="out-in" appear>-->
    <!--        <keep-alive v-if="keepAliveComponents.length" :include="">-->
    <!--          <component :is="Component" :key="route.fullPath"/>-->
    <!--        </keep-alive>-->
    <!--        <component v-else :is="Component" :key="route.fullPath"/>-->
    <!--      </transition>-->
    <!--    </template>-->

    <template #default="{Component, route}">
      <component :is="Component" :key="route.fullPath"></component>
    </template>

  </RouterView>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "MainView",
  components: {},
  props: {
    notNeedKey: {
      type: Boolean,
      default: false,
    },
    animate: {
      type: Boolean,
      default: true,
    },
  },
  setup() {

  },
});
</script>

<style scoped></style>
