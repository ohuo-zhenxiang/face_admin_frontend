<template>
  <div class="layout-header">
    <!--    &lt;!&ndash; 顶部菜单 &ndash;&gt;-->
    <!--    <div class="layout-header-left">-->
    <!--      <div class="logo">-->
    <!--        <img src="@/assets/images/logo.png" alt=""/>-->
    <!--        <h2 class="title">NaiveUiAdmin</h2>-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <AsideMenu-->
    <!--        v-model:collapsed="collapsed"-->
    <!--        v-model:location="getMenuLocation"-->
    <!--        :inverted="getInverted"-->
    <!--        mode="horizontal"-->
    <!--    />-->

    <!-- 左侧菜单 -->
    <div class="layout-header-left">
      <!--菜单收起-->
      <div
          class="ml-1 layout-header-trigger layout-header-trigger-min"
          @click="() => $emit('update:collapsed', !collapsed)"
      >
        <n-icon size="18" v-if="collapsed">
          <MenuUnfoldOutlined/>
        </n-icon>
        <n-icon size="18" v-else>
          <MenuFoldOutlined/>
        </n-icon>
      </div>

      <!-- 刷新 -->
<!--      <div class="mr-1 layout-header-trigger layout-header-trigger-min" v-if="headerSetting.isReload"-->
<!--           @click="reloadPage">-->
<!--        <n-icon size="18">-->
<!--          <ReloadOutlined/>-->
<!--        </n-icon>-->
<!--      </div>-->

      <!--面包屑-->
      <n-breadcrumb v-if="crumbsSetting.show">
        <template v-for="routeItem in breadcrumbList" :key="routeItem.name === 'Redirect' ? void 0 : routeItem.name">
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <n-dropdown v-if="routeItem.children.length" :options="routeItem.children" @select="dropdownSelect">
              <span class="link-text">
                <component v-if="crumbsSetting.showIcon && routeItem.meta.icon" :is="routeItem.meta.icon"/>
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span class="link-text" v-else>
              <component v-if="crumbsSetting.showIcon && routeItem.meta.icon" :is="routeItem.meta.icon"/>
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>

    <!-- 右侧菜单 -->
    <div class="layout-header-right">

      <!-- 无卵用的搜索icon -->
<!--      <div class="layout-header-trigger layout-header-trigger-min" v-for="item in iconList" :key="item.icon">-->
<!--        <n-tooltip placement="bottom">-->
<!--          <template #trigger>-->
<!--            <n-icon size="18">-->
<!--              <component :is="item.icon" v-on="item.eventObject || {}"/>-->
<!--            </n-icon>-->
<!--          </template>-->
<!--          <span>{{ item.tips }}</span>-->
<!--        </n-tooltip>-->
<!--      </div>-->

      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <router-link to="/dashboard/overview">
              <n-icon size="18">
                <HomeOutlined/>
              </n-icon>
            </router-link>
          </template>
          <span>首页</span>
        </n-tooltip>

      </div>

      <!-- 切换全屏 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="fullscreenIcon" @click="toggleFullScreen"/>
            </n-icon>
          </template>
          <span>全屏</span>
        </n-tooltip>
      </div>

      <!-- 个人中心 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-dropdown trigger="hover" @select="avatarSelect" :options="avatarOptions">
          <div class="avatar">
            <n-avatar round>
              {{ username }}
              <template #icon>
                <UserOutlined/>
              </template>
            </n-avatar>
          </div>
        </n-dropdown>
      </div>

      <!--样式设置：暂时不用-->
<!--      <div class="layout-header-trigger layout-header-trigger-min" @click="openSetting">-->
<!--        <n-tooltip placement="bottom-end">-->
<!--          <template #trigger>-->
<!--            <h1>111</h1>-->
<!--            <n-icon size="18" style="font-weight: bold">-->
<!--              <SettingOutlined/>-->
<!--            </n-icon>-->
<!--          </template>-->
<!--          <span>项目配置</span>-->
<!--        </n-tooltip>-->
<!--      </div>-->

    </div>


  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, toRefs, ref, computed, unref} from "vue";
import {useRoute, useRouter} from 'vue-router';
import components from "@/layout/components/Header/components";
import {NDialogProvider, useDialog, useMessage} from 'naive-ui';
import {TABS_ROUTES} from "@/store/mutation-types";
import {useUser} from "@/store/modules/user";
// useScreenLockStore
// ProjectSetting
import {AsideMenu} from '@/layout/components/Menu/index';
import {useProjectSetting} from '@/hooks/setting/useProjectSetting';
import {websiteConfig} from "@/settings/website.config";

export default defineComponent({
  name: 'PageHeader',
  components: {...components, NDialogProvider, AsideMenu},
  props: {
    collapsed: {
      type: Boolean,
    },
    inverted: {
      type: Boolean,
    },
  },
  setup(props) {
    const userStore = useUser();
    const message = useMessage();
    const dialog = useDialog();
    const {navMode, navTheme, headerSetting, menuSetting, crumbsSetting} = useProjectSetting();

    const {phone} = userStore?.info || {}

    const drawerSetting = ref();

    const state = reactive({
      username: phone ?? '',
      fullscreenIcon: 'FullscreenOutlined',
      navMode,
      navTheme,
      headerSetting,
      crumbsSetting,
    });

    const getInverted = computed(() => {
      return ['light', 'header-dark'].includes(unref(navTheme)) ? props.inverted : !props.inverted;
    });

    const mixMenu = computed(() => {
      return unref(menuSetting).mixMenu;
    });

    const getChangeStyle = computed(() => {
      const {collapsed} = props;
      const {minMenuWidth, menuWidth} = unref(menuSetting);
      return {
        left: collapsed ? `${minMenuWidth}px` : `${menuWidth}px`,
        width: `calc(100% - ${collapsed ? `${minMenuWidth}px` : `${menuWidth}px`})`,
      };
    });

    const getMenuLocation = computed(() => {
      return 'header';
    });

    const router = useRouter();
    const route = useRoute();

    const generator: any = (routerMap) => {
      return routerMap.map((item) => {
        // 结合filter过滤路由定义中hideBreadcrumb参数不显示的路由
        if (item.meta?.hideBreadcrumb === true) {return null};
        const currentMenu = {
          ...item,
          label: item.meta.title,
          key: item.name,
          disabled: item.path === '/',
        };
        // 是否有子菜单，并递归处理
        if (item.children && item.children.length > 0) {
          // Recursion
          currentMenu.children = generator(item.children, currentMenu);
        }
        if (!Boolean(currentMenu.meta.hideBreadcrumb)){
          return currentMenu
        }
      }).filter(Boolean);
    };

    const breadcrumbList = computed(() => {
      return generator(route.matched);
    });

    const dropdownSelect = (key) => {
      router.push({name: key});
    };

    // 刷新页面
    const reloadPage = () => {
      // console.log(unref(route).fullPath)
      router.push({
        path: unref(route).fullPath
      });
    };

    // 退出登录
    const doLogout = () => {
      dialog.info({
        title: '提示',
        content: '您确定要退出登录吗',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          userStore.logout().then(() => {
            message.success('成功退出登录');
            // 移除标签页
            localStorage.removeItem(TABS_ROUTES);
            router.replace({
              name: 'Login',
              query: {
                redirect: route.fullPath,
              },
            }).finally(() => location.reload());
          });
        },
        onNegativeClick: () => {
        },
      });
    };

    // 切换全屏图标
    const toggleFullscreenIcon = () => (state.fullscreenIcon = document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined');

    // 监听全屏切换事件
    document.addEventListener('fullscreenchange', toggleFullscreenIcon);

    // 全屏切换
    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    // 图标列表
    const iconList = [
      {
        icon: 'SearchOutlined',
        tips: '搜索',
      },
      {
        icon: 'GithubOutlined',
        tips: 'github',
        eventObject: {
          click: () => window.open('https://github.com/'),
        },
      },
      // {
      //   icon: 'LockOutlined',
      //   tips: '锁屏',
      //   eventObject: {
      //     click: () => useLockscreen.setLock(true),
      //   },
      // },
    ];
    const avatarOptions = [
      // {
      //   label: '个人设置',
      //   key: 1,
      // },
      {
        label: '退出登录',
        key: 2,
      },
    ];

    // 头像下拉菜单
    const avatarSelect = (key) => {
      switch (key) {
        case 1:
          router.push({name: 'Setting'});
          break;
        case 2:
          doLogout();
          break;
      }
    };

    function openSetting() {
      const {openDrawer} = drawerSetting.value;
      openDrawer();
    }

    return {
      ...toRefs(state),
      iconList,
      toggleFullScreen,
      doLogout,
      route,
      dropdownSelect,
      avatarOptions,
      getChangeStyle,
      avatarSelect,
      breadcrumbList,
      reloadPage,
      drawerSetting,
      openSetting,
      getInverted,
      getMenuLocation,
      mixMenu,
      websiteConfig,
    };

  },
});
</script>

<style lang="less" scoped>
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: 64px;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 11;

  &-left {
    display: flex;
    align-items: center;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      line-height: 64px;
      overflow: hidden;
      white-space: nowrap;
      padding-left: 10px;

      img {
        width: auto;
        height: 32px;
        margin-right: 10px;
      }

      .title {
        margin-bottom: 0;
      }
    }

    ::v-deep(.ant-breadcrumb span:last-child .link-text) {
      color: #515a6e;
    }

    .n-breadcrumb {
      display: inline-block;
    }

    &-menu {
      color: var(--text-color);
    }
  }

  &-right {
    display: flex;
    align-items: center;
    margin-right: 20px;

    .avatar {
      display: flex;
      align-items: center;
      height: 64px;
    }

    > * {
      cursor: pointer;
    }
  }

  &-trigger {
    display: inline-block;
    width: 64px;
    height: 64px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .n-icon {
      display: flex;
      align-items: center;
      height: 64px;
      line-height: 64px;
    }

    &:hover {
      background: hsla(0, 0%, 100%, 0.08);
    }

    .anticon {
      font-size: 16px;
      color: #515a6e;
    }
  }

  &-trigger-min {
    width: auto;
    padding: 0 12px;
  }
}

.layout-header-light {
  background: #fff;
  color: #515a6e;

  .n-icon {
    color: #515a6e;
  }

  .layout-header-left {
    ::v-deep(
        .n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link
      ) {
      color: #515a6e;
    }
  }

  .layout-header-trigger {
    &:hover {
      background: #f8f8f9;
    }
  }
}

.layout-header-fix {
  position: fixed;
  top: 0;
  right: 0;
  left: 200px;
  z-index: 11;
}

//::v-deep(.menu-router-link) {
//  color: #515a6e;
//
//  &:hover {
//    color: #1890ff;
//  }
//}
</style>
