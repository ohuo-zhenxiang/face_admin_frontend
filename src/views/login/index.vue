<template>
  <div class="view-account">
    <div class="view-account-header"></div>
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">loginImage</div>
        <div class="view-account-top-desc">loginDesc</div>
      </div>
      <div class="view-account-form">
        <n-form
            ref="formRef"
            label-placement="left"
            size="large"
            :model="formInline"
            :rules="rules"
        >
          <!--  username        -->
          <n-form-item path="username">
            <n-input
                v-model:value="formInline.username"
                placeholder="input username"
            >
              <!--  icon            -->
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline/>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <!--  password        -->
          <n-form-item path="password">
            <n-input
                v-model:value="formInline.password"
                type="password"
                show-password-on="click"
                placeholder="input password"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline/>
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <!--    autoLogin-checkbox    -->
          <n-form-item class="default-color">
            <div class="flex" style="width: 100%">
              <div class="">
                <n-checkbox v-model:checked="autoLogin">自动登录</n-checkbox>
              </div>
              <div class="" style="margin-left: auto">
                <a href="https://www.baidu.com">忘记密码</a>
              </div>
            </div>
          </n-form-item>

          <!--  login-button      -->
          <n-form-item>
            <n-button
                type="primary"
                @click="handleSubmit"
                size="large"
                :loading="loading"
                block
            >登录
            </n-button
            >
          </n-form-item>

          <n-form-item>
            <n-button
                type="default"
                @click=""
                size="large"
                :loading="loading"
                block
            >注册
            </n-button
            >
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useUserStore} from "@/store/modules/user";
import {useMessage} from "naive-ui";
import {PersonOutline, LockClosedOutline} from "@vicons/ionicons5";
import {ResultEnum} from "@/enums/httpEnum";
import {PageEnum} from "@/enums/pageEnum"

interface FormState {
  username: string;
  password: string;
}

const formRef = ref();
const message = useMessage();
const loading = ref(false);
const autoLogin = ref(true);
const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME;

const formInline = reactive({
  username: "admin",
  password: "admin",
  isCaptcha: true,
});

const rules = {
  username: {required: true, message: "请输入用户名", trigger: "blur"},
  password: {required: true, message: "请输入密码", trigger: "blur"},
};

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

const handleSubmit = (e) => {
  e.preventDefault();
  formRef.value.validate(async (errors) => {
    if (!errors) {
      const {username, password} = formInline;
      message.info("登录中...");
      loading.value = true;

      const params: FormState = {username, password};

      try {
        const response = await userStore.login(params);
        const {status, data} = response;
        message.destroyAll();
        if (status == ResultEnum.SUCCESS) {
          const toPath = decodeURIComponent((route.query?.redirect || "/") as string);
          message.success("登录成功，即将进入系统");
          if (route.name == LOGIN_NAME){
            router.replace('/');
          } else router.replace(toPath)
        } else {
          message.error("登录失败" || data.detail);
        }
      } finally {
        loading.value = false;
      }
    } else {
      message.error("请填写完整信息");
    }
  });
};
</script>

<style lang="less" scoped>
.view-account {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  //background-color: pink;

  &-container {
    flex: 1;
    padding: 32px 12px;
    max-width: 384px;
    min-width: 320px;
    margin: 0 auto;
  }

  &-top {
    padding: 32px 0;
    text-align: center;

    &-desc {
      font-size: 14px;
      color: #808695;
    }
  }

  &-other {
    width: 100%;
  }

  .default-color {
    color: #515a6e;

    .ant-checkbox-wrapper {
      color: #515a6e;
    }
  }
}

@media (min-width: 768px) {
  .view-account {
    background-image: url("@/assets/images/login.svg");
    background-repeat: no-repeat;
    background-position: 50%;
    background-size: 100%;
  }

  .page-account-container {
    padding: 32px 0 24px 0;
  }
}
</style>
