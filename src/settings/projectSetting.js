const setting = {
    // 导航模式：vertical 左侧菜单模式；horizontal 顶部菜单模式
    navMode: 'vertical',
    // 导航风格 dark light header-dark
    navTheme: 'dark',
    // 是否处于移动端模式
    isMobile: false,
    // 顶部
    headerSetting: {
        //bg color
        bgColor: '#fff',
        // 固定顶部
        fixed: true,
        // 显示重载按钮
        isReload: true,
    },
    // 页脚
    showFooter: true,
    // 多标签
    multiTabsSetting: {
        // bg color
        bgColor: '#fff',
        show: true,
        // 固定多标签
        fixed: true,
    },
    // 菜单
    menuSetting: {
        // 最小宽度
        minMenuWidth: 64,
        // 菜单宽度
        menuWidth: 200,
        // 固定菜单
        fixed: true,
        // 分割菜单
        mixMenu: false,
        // 触发移动端侧边栏的宽度
        mobileWidth: 800,
        // 折叠菜单
        collapsed: false,
    },
    // 面包屑
    crumbsSetting: {
        show: true,
        showIcon: false,
    },
    // 菜单权限模式：FIXED 前端固定路由；BACK 动态获取；
    permissionMode: 'FIXED',
    isPageAnimate: true,
    pageAnimateType: 'zoom-fade',
};
export default setting;
//# sourceMappingURL=projectSetting.js.map