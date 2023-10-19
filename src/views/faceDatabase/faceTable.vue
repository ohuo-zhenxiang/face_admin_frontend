<template>
  <n-card :bordered="false" class="proCard">
    <!--    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">-->
    <!--      <template #statusSlot="{model, field}">-->
    <!--        <n-input v-model:value="model[field]"/>-->
    <!--      </template>-->
    <!--    </BasicForm>-->

    <BasicTable :columns="columns" :request="loadDataTable" :row-key="(row)=>row.id" ref="actionRef"
                :actionColumn="actionColumn" @update:checked-row-keys="onCheckedRow" :scroll-x="1090">
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PersonAdd16Regular/>
            </n-icon>
          </template>
          上传人脸
        </n-button>
      </template>

      <!--      <template #toolbar>-->
      <!--        <n-button type="primary" @click="reloadTable">刷新数据</n-button>-->
      <!--      </template>-->
    </BasicTable>

    <!-- 新建的弹窗 -->
    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="上传人脸">
      <template #action>
        <n-space>
          <n-button @click="()=>(showModal=false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>

      <n-form :model="formParams" :rules="rules" ref="formRef" label-placement="left" :label-width="80" class="py-4">
        <n-form-item label="姓名" path="name">
          <n-input placeholder="请输入名称" v-model:value="formParams.name"/>
        </n-form-item>
        <n-form-item label="备注" path="phone">
          <n-input placeholder="请输入备注" v-model:value="formParams.phone"></n-input>
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-radio-group v-model:value="formParams.gender">
            <n-radio value="男">男</n-radio>
            <n-radio value="女">女</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="图片" path="image">
          <n-upload accept="image/*" list-type="image-card" :max="1" :on-before-upload="handleBeforeUpload">
            <n-upload-dragger>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
      </n-form>
    </n-modal>


    <!-- 编辑得弹窗  -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑">
      <template #action>
        <n-space>
          <n-button @click="()=>(showEditModal=false)">取消</n-button>
          <n-button type="info" :loading="formEditBtnLoading" @click="confirmEditForm">确认</n-button>
        </n-space>
      </template>

      <n-form :model="editParams" ref="editRef" label-placement="left" :label-width="80" class="py-4">
        <n-form-item label="姓名" path="name">
          <n-input placeholder="请输入名称" v-model:value="editParams.name"/>
        </n-form-item>
        <n-form-item label="备注" path="phone">
          <n-input placeholder="请输入备注" v-model:value="editParams.phone"></n-input>
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-radio-group v-model:value="editParams.gender">
            <n-radio value="男">男</n-radio>
            <n-radio value="女">女</n-radio>
          </n-radio-group>
        </n-form-item>

        <!--        <n-form-item label="图片" path="image">-->
        <!--          <n-upload accept="image/*" list-type="image-card" :max="1" :on-before-upload="handleBeforeEditUpload">-->
        <!--            <n-upload-dragger>-->
        <!--              点击上传-->
        <!--            </n-upload-dragger>-->
        <!--          </n-upload>-->
        <!--        </n-form-item>-->
      </n-form>
    </n-modal>
  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref} from 'vue';
import {useMessage, useDialog} from 'naive-ui';
import {BasicTable, TableAction} from '@/components/Table';
import {getFaceList, createFace, deleteFace, updateFace} from '@/api/faces/face';
import {columns} from './columns';
import {PlusOutlined} from '@vicons/antd';
import {PersonAdd16Regular} from '@vicons/fluent';
import {type FormRules} from 'naive-ui';


const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
  phone: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入备注',
  },
  // image: {
  //   required: true,
  //   trigger: ['blur', 'input'],
  //   message: '请上传图片',
  // },
};


const formRef: any = ref(null);
const message = useMessage();
const n_dialog = useDialog();
const actionRef = ref();

const showModal = ref(false);
const showEditModal = ref(false);
const formBtnLoading = ref(false);
const formEditBtnLoading = ref(false);
const formParams = reactive({
  name: '',
  phone: '',
  file: null,
  gender: '男',
});

function formParamsReload(){
  formParams.name = '';
  formParams.phone = '';
  formParams.file = null;
  formParams.gender = '';
}

const editParams = reactive({
  name: '',
  phone: '',
  face_id: null,
  file: null,
  gender: '',
});

const params = ref({
  pageSize: 5,
  name: 'jack',
});

const actionColumn = reactive({
  width: 200,
  title: '操作',
  key: 'action',
  fixed: 'right',
  align: 'center',
  render(record) {
    return h(TableAction as any, {
      style: 'button',
      actions: [
        {
          label: '编辑',
          type: 'info',
          ghost: true,
          onClick: handleEdit.bind(null, record),
          ifShow: () => {
            return true;
          },
          // auth: ['admin', 'editor'],
        },
        {
          label: '删除',
          type: 'error',
          ghost: true,
          style: 'margin-left: 5px',
          onClick: handleDelete.bind(null, record),
          // 根据业务控制是否显示 isShow 和 auth 是并且关系
          ifShow: () => {
            return true;
          },
          // 根据权限控制是否显示：有权限，会显示，支持多个
          // auth: ['basic_list']
        },
        // {
        //   label: "测试",
        //   key: 'test',
        //   ifShow: true,
        // }
      ],
      // 暂时不用
      dropDownActions: [
        // {
        //   label: '启用.....',
        //   key: 'enabled',
        //   // 根据业务控制是否显示：非enable的状态不显示启用按钮
        //   ifShow: () => {
        //     return true;
        //   },
        // },
        // {
        //   label: '禁用',
        //   key: 'disabled',
        //   ifShow: () => {
        //     return true;
        //   }
        // }
      ],
      select: (key) => {
        window['$message'].info(`click on ${key} button`)
      },
    });
  },
});


function addTable() {
  showModal.value = true;
}

const loadDataTable = async (res) => {
  try {
    const response = await getFaceList({...formParams, ...params.value, ...res});
    // console.log('response', response);
    if (response.status === 200) {
      const {items, page, pages, size} = response.data;
      const result = {
        list: items,
        page: page,
        pageCount: pages,
        pageSize: size,
      };
      return result;
    } else {
      return {
        list: [],
        page: 1,
        pageCount: 1,
        pageSize: 10,
      };
    }
  } catch (err: any) {
    console.log(err)
  }
};

const handleBeforeUpload = (file) => {
  formParams.file = file.file.file;
  return true;
};

function onCheckedRow(rowKeys) {
  console.log(rowKeys);
};

function reloadTable() {
  actionRef.value.reload();
};

// 新建的表单确认
async function confirmForm(e) {
  e.preventDefault();
  formBtnLoading.value = true;
  // console.log('formRef', formParams.file)

  const {file, name, phone, gender} = toRaw(formParams);
  const formData = new FormData();
  if (file){
    formData.append('file', file);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('gender', gender);
  }
  try {
    const response = await createFace(formData);
    // console.log('created response', response.status)
    if (response.status === 200) {
      message.success('新建成功');
      setTimeout(() => {
        formBtnLoading.value = false;
        showModal.value = false;
        formParamsReload();
        reloadTable();
      });
    }
  } catch (err: any) {
    // console.log(err)
    const response = err.response;
    const {status} = response;
    if (status === 409) {
      message.error("备注标识已存在")
    } else if (status === 400) {
      message.error("文件上传错误")
    }
  } finally {
    formBtnLoading.value = false;
  }
  // formRef.value.validate((errors) => {
  //   console.log("errors", errors)
  //   if (!errors) {
  //     window['$message'].success('新建成功');
  //     setTimeout(() => {
  //       showModal.value = false;
  //       reloadTable();
  //     });
  //   } else {
  //     window['$message'].error('请填写完整信息');
  //   }
  //   formBtnLoading.value = false;
  // });
}

// 编辑得表单确认
async function confirmEditForm(e) {
  e.preventDefault();
  formEditBtnLoading.value = true;
  const {name, phone, face_id, gender} = editParams;
  const editForm = new FormData();
  editForm.append('name', name);
  editForm.append('phone', phone);
  editForm.append('gender', gender);
  try {
    const response = await updateFace(face_id, editForm);
    if (response.status === 200) {
      message.success('编辑成功');
      setTimeout(() => {
        formEditBtnLoading.value = false;
        showEditModal.value = false;
        reloadTable();
      });
    }
  } catch (err: any) {
    // console.log(err)
    const response = err.response;
    const {status} = response;
    if (status === 400) {
      message.error("备注标识已存在")
    }
  }
}


// 处理编辑
function handleEdit(record: Recordable) {
  // console.log('onclick edit', record);
  const {name, phone, id, gender} = record;
  editParams.name = name;
  editParams.phone = phone;
  editParams.face_id = id;
  editParams.gender = gender;
  showEditModal.value = true;
}

// 处理删除
function handleDelete(record: Recordable) {
  // console.log('delete record', record);
  // message.info('删除按钮');
  n_dialog.warning({
    title: '警告',
    content: `您确定删除 ${record.name} 的人脸数据吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteFace(record.id);
        if (response.status === 200) {
          message.success('删除成功');
          reloadTable()
        } else {
        }
      } catch (err: any) {
        // console.log(err)
        message.error("删除失败")
      }
    },
    onNegativeClick: () => {
    }
  })
  // window['$message'].info('onclick delete');  // 这个message组件报错
}

// function handleSubmit(values: Recordable) {
//   console.log(values);
//   reloadTable();
// }

// function handleReset(values: Recordable) {
//   console.log(values);
// }

</script>


<style scoped>
</style>