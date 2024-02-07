<template>

  <n-card>
    <n-space justify="space-between">
      <n-button type="primary" @click="AddCamera" size="medium">
        <template #icon>
          <n-icon>
            <CameraAdd24Regular/>
          </n-icon>
        </template>
        新增视频
      </n-button>
      <n-button type="primary" @click="checkAllCamera" size="medium" :loading="checkAllBtnLoading">
        <template #icon>
          <n-icon>
            <BarcodeScanner24Filled/>
          </n-icon>
        </template>
        一键检测
      </n-button>
    </n-space>
    <!--new add-->


    <!--新增设备的modal-->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新增视频">
      <template #action>
        <n-space>
          <n-button @click="()=>(showAddModal=false)">取消</n-button>
          <n-button type="primary" :loading="formAddBtnLoading" @click="confirmAddForm">确认</n-button>
        </n-space>
      </template>
      <n-form :model="formAdd" ref="formAddRef" :rules="rules" label-placement="left" :label-width="80" class="py-4">
        <n-form-item label="视频名称" path="cam_name">
          <n-input v-model:value="formAdd.cam_name" placeholder="请输入视频名称"/>
        </n-form-item>
        <n-form-item label="流类型" path="cam_type">
          <n-select v-model:value="formAdd.cam_type" :options="select_options" placeholder="请选择流地址类型"/>
        </n-form-item>
        <n-form-item label="流地址" path="cam_url">
          <n-input v-model:value="formAdd.cam_url" placeholder="请输入流地址"/>
        </n-form-item>
      </n-form>
      <n-blockquote>
        <p class="text-gray-400">流地址填写格式请参考：</p>
      </n-blockquote>
      <ul class="text-gray-400">
        <li>rtsp://127.0.0.1:8080</li>
        <li>rtmp://127.0.0.1:8080</li>
        <!--        <li>webrtc://127.0.0.1:8080/live/livestream</li>-->
      </ul>

    </n-modal>

    <!--修改设备的model-->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑视频">
      <template #action>
        <n-space>
          <n-button @click="()=>(showEditModal=false)">取消</n-button>
          <n-button type="primary" :loading="formEditBtnLoading" @click="confirmEditForm">确认</n-button>
        </n-space>
      </template>
      <n-form :model="formEdit" ref="formEditRef" label-placement="left" :label-width="80" class="py-4">
        <n-form-item label="视频名称" path="cam_name">
          <n-input v-model:value="formEdit.cam_name" placeholder="请输入视频名称"/>
        </n-form-item>
        <n-form-item label="流类型" path="cam_type">
          <n-select v-model:value="formEdit.cam_type" :options="select_options" placeholder="请选择流地址类型"/>
        </n-form-item>
        <n-form-item label="流地址" path="cam_url">
          <n-input v-model:value="formEdit.cam_url" placeholder="请输入流地址"/>
        </n-form-item>
      </n-form>
    </n-modal>

    <n-data-table
        style="margin-top: 16px"
        :row-key="(row)=>row.id"
        striped
        :columns="columns"
        :data="cameraDates"
        size="large"
    />
  </n-card>

</template>


<script setup lang="ts">
import {h, reactive, ref, onMounted} from 'vue';
import {NSpace, NTime, NTag, NButton, useMessage, useDialog} from 'naive-ui';
import type {DataTableColumns, FormRules} from 'naive-ui';
import {CameraAdd24Regular, BarcodeScanner24Filled} from '@vicons/fluent';
import {getCameraList, addCamera, updateCamera, deleteCamera, checkRtspOrRtmp} from "@/api/cameras/camera";
import {usePermission} from '@/permission';


const {hasPermission} = usePermission();
const message = useMessage();
const n_dialog = useDialog();
const alignStyle = 'center';
const showAddModal = ref(false);
const showEditModal = ref(false);
const formAddBtnLoading = ref(false);
const formEditBtnLoading = ref(false);
const checkBtnLoading = ref<boolean[]>([]);
const checkAllBtnLoading = ref(false);
const cameraDates = ref([]);
const select_options = [
  {label: 'RTSP', value: 'rtsp'},
  {label: 'RTMP', value: 'rtmp'},
  // {label: 'WebRTC', value: 'webrtc'},
]

const rules: FormRules = {
  cam_name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入名称'
  },
  cam_type: {
    required: true,
    trigger: ['blue', 'input'],
    message: '请选择类型',
  },
  cam_url: {
    required: true,
    trigger: ['blur', 'select'],
    message: '请输入地址',
  },
}

type RowData = {
  id: number
  cam_token: string
  cam_name: string
  cam_type: string
  cam_url: string
  cam_status: boolean
  update_time: string
  created_time: string
  index: number
}

const formAdd = reactive({
  cam_name: '',
  cam_type: '',
  cam_url: '',
  cam_status: false,
});

const formEdit = reactive({
  cam_id: null,
  cam_name: '',
  cam_type: '',
  cam_url: '',
})

function clearFormAdd() {
  formAdd.cam_name = '';
  formAdd.cam_type = '';
  formAdd.cam_url = '';
  formAdd.cam_status = false;
}

const createColumns = ({checkRow, editRow, deleteRow}: {
  checkRow: (rowData: RowData) => void
  editRow: (rowData: RowData) => void
  deleteRow: (rowData: RowData) => void
}): DataTableColumns<RowData> => {
  return [
    {
      title: '视频名称',
      key: 'cam_name',
      width: 80,
      align: alignStyle,
    },
    {
      title: '流类型',
      key: 'cam_type',
      width: 60,
      align: alignStyle,
      render(row) {
        const typeText = row.cam_type === 'rtsp' ? 'RTSP' : row.cam_type === 'rtmp' ? 'RTMP' : row.cam_type === 'webrtc' ? 'WebRTC' : 'None'
        return h(NTag, {type: 'default'}, {default: () => typeText})
      }
    },
    {
      title: '流地址',
      key: 'cam_url',
      width: 120,
      ellipsis: {tooltip: true},
      align: alignStyle,
    },
    {
      title: '状态',
      key: 'cam_status',
      width: 60,
      align: alignStyle,
      render(row) {
        const statusText = row.cam_status ? '正常' : '故障';
        const statusType = row.cam_status ? 'success' : 'error';
        return h(NTag, {type: statusType}, {default: () => statusText})
      }
    },
    {
      title: '更新时间',
      key: 'update_time',
      width: 100,
      align: alignStyle,
      render(row) {
        return h(NTime, {time: new Date(row.update_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '创建时间',
      key: 'created_time',
      width: 100,
      align: alignStyle,
      render(row) {
        return h(NTime, {time: new Date(row.created_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: alignStyle,
      render(row) {
        return h(
            NSpace,
            {
              justify: 'center'
            },
            {
              default: () => [
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      ghost: true,
                      loading: checkBtnLoading.value[row.index],
                      onClick: () => checkRow(row),
                    },
                    {default: () => '检测'}
                ),
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'info',
                      ghost: true,
                      onClick: () => editRow(row),
                    },
                    {default: () => '编辑'}
                ),
                hasPermission('admin') ? h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      ghost: true,
                      onClick: () => deleteRow(row),
                    },
                    {default: () => '删除'}
                ) : null,
              ]
            }
        )
      }
    }
  ]
}

const loadCamData = async () => {
  try {
    const response = await getCameraList()
    if (response.status === 200) {
      cameraDates.value = response.data.map((row, index) => {
        return {...row, index}
      });
      checkBtnLoading.value = new Array(cameraDates.value.length).fill(false);
    }
  } catch (error) {
    console.log(error)
  }
};
onMounted(loadCamData);

const columns = createColumns({
  async checkRow(rowData: RowData) {
    // console.log('checkcheck', rowData.index)
    checkBtnLoading.value[rowData.index] = true;
    if (rowData.cam_type === 'rtsp' || rowData.cam_type === 'rtmp') {
      const formData = new FormData();
      formData.append('id', String(rowData.id));
      formData.append('cam_url', rowData.cam_url);
      formData.append('cam_status', String(rowData.cam_status));
      formData.append('cam_type', rowData.cam_type);
      try {
        const response = await checkRtspOrRtmp(formData);
        if (response.status === 200) {
          message.success(`检测完成，当前视频流 ${rowData.cam_name} 可正常使用。`)
        }
      } catch (error) {
        message.error(`检测完成，当前视频流 ${rowData.cam_name} 发生故障，请检修！`)
        console.log(error)
      } finally {
        checkBtnLoading.value[rowData.index] = false;
        loadCamData();
      }
    } else if (rowData.cam_type === 'webrtc') {

    }
  },
  editRow(rowData) {
    formEdit.cam_name = rowData.cam_name;
    formEdit.cam_url = rowData.cam_url;
    formEdit.cam_type = rowData.cam_type;
    formEdit.cam_id = rowData.id;
    showEditModal.value = true;
  },
  deleteRow(rowData) {
    n_dialog.warning({
      title: '警告',
      content: '您确定要删除该视频流地址吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteCamera(rowData.id)
          if (response.status === 200) {
            message.success('删除成功')
            loadCamData();
          }
        } catch (error: any) {
          console.log(error)
          message.error('删除失败')
        }
      }
    })
  }
})

function AddCamera() {
  showAddModal.value = true;
}

async function checkSingleRow(rowData: RowData) {
  checkBtnLoading.value[rowData.index] = true;
  console.log(rowData.cam_status)
  if (rowData.cam_type === 'rtsp' || rowData.cam_type === 'rtmp') {
    const formData = new FormData();
    formData.append('id', String(rowData.id));
    formData.append('cam_url', rowData.cam_url);
    formData.append('cam_status', String(rowData.cam_status));
    formData.append('cam_type', rowData.cam_type);
    try {
      await checkRtspOrRtmp(formData);
    } catch (error) {
      console.log(error)
    } finally {
      checkBtnLoading.value[rowData.index] = false;
    }
  } else if (rowData.cam_type === 'webrtc') {
  }
}

async function checkAllCamera() {
  try {
    checkAllBtnLoading.value = true;

    if (cameraDates.value) {
      // 创建一个Promise数组，每个Promise表示一行url的检测操作
      const checkPromises = cameraDates.value.map(async (rowData) => {
        await checkSingleRow(rowData); // 执行检测操作
      });

      // 使用Promise.all等待所有检测完成
      await Promise.all(checkPromises)

      message.success('一键检测已完成，所有视频流状态已更新！')
    }
  } catch (error) {
    console.log(error)
  } finally {
    await loadCamData(); // 刷新表格数据
    checkAllBtnLoading.value = false;
  }
}

async function confirmAddForm(e) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    const response = await addCamera(toRaw(formAdd))
    if (response.status === 200) {
      message.success('新建成功');
      formAddBtnLoading.value = false;
      showAddModal.value = false;
      loadCamData();
      clearFormAdd();
    }
  } catch (error: any) {
    const er = error.response;
    if (er.status === 409) {
      message.error('该视频流地址已存在')
    } else if (er.status === 423) {
      message.error('视频流格式与视频流类型不一致')
    }
  } finally {
    formAddBtnLoading.value = false;
  }
}

async function confirmEditForm(e) {
  e.preventDefault();
  formEditBtnLoading.value = true;
  try {
    const response = await updateCamera(toRaw(formEdit))
    if (response.status === 200) {
      message.success('修改成功')
      formEditBtnLoading.value = false;
      showEditModal.value = false;
      loadCamData();
    }
  } catch (err: any) {
    const er = err.response;
    if (er.status === 409) {
      message.error("该视频流地址已存在")
    } else if (er.status === 423){
      message.error('视频流格式与视频流类型不一致')
    } else {
      console.log(err)
    }
  } finally {
    formEditBtnLoading.value = false;
  }
}

</script>


<style scoped lang="less">

</style>