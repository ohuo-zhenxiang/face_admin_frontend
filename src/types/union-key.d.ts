declare namespace UnionKey {
    /** http请求头的content-type**/
    type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';

    /**
     * 布局组件的名称
     * - basic 基础布局 (包含全局头部、多页签、侧边栏、底部等公共部分)
     * - blank 空白布局 (单个页面)
     */
    type LayoutComponentType = 'basic' | 'blank';

     /**
     * 登录模块
     * - pwd-login: 账密登录
     * - register: 手机验证码登录
     * - reset-pwd: 重置密码
     */
    type LoginType = 'pwd-login' | 'register' | 'reset-pwd';

    /**
     * 内容溢出时的出现滚动条的方式
     * - wrapper 布局组件最外层的元素出现滚动条
     * - content 主体内容组件出现滚动条
     */
    type ThemeScrollMode = 'wrapper' | 'content';

    /**
     * 过渡动画类型
     * - zoom-fade: 渐变
     * - zoom-out: 闪现
     * - fade-slide: 滑动
     * - fade: 消退
     * - fade-bottom: 底部消退
     * - fade-scale: 缩放消退
     */
    type ThemeAnimateMode = 'zoom-fade' | 'zoom-out' | 'fade-slide' | 'fade' | 'fade-bottom' | 'fade-scale';
}