<template>
  <n-card>
    <!--新增button-->
    <n-button type="primary" @click="AddTask">
      <template #icon>
        <n-icon>
          <ClipboardTaskAdd24Regular/>
        </n-icon>
      </template>
      新建任务
    </n-button>

    <!--新建任务的modal-->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新建人脸识别任务">
      <template #action>
        <n-space>
          <n-button @click="()=>(showAddModal=false)">取消</n-button>
          <n-button type="primary" :loading="formAddBtnLoading" @click="confirmAddForm">确认</n-button>
        </n-space>
      </template>
      <n-space style="margin-top: 14px">
        <n-form :model="formAdd"
                ref="formAddRef"
                :rules="rules"
                label-placement="left"
                label-width="auto"
                label-align="right"
                require-mark-placement="right-hanging"
        >
          <n-form-item label="任务名称" path="name">
            <n-input v-model:value="formAdd.name" placeholder="请输入任务名称"/>
          </n-form-item>
          <n-form-item label="扩展检测项" path="ex-detect">
            <n-checkbox-group v-model:value="formAdd.ex_detect" size="large">
              <n-space>
                <n-checkbox value="SFAS">静默活体检测</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>
          <n-form-item label="时间范围" path="time_range">
            <n-date-picker v-model:value="formAdd.time_range" type="datetimerange" :shortcuts="rangeShortcuts"/>
          </n-form-item>
          <n-form-item label="时间间隔(s)" path="interval_seconds">
            <n-input-number v-model:value="formAdd.interval_seconds" placeholder="请输入时间间隔" :min="5"/>
          </n-form-item>
          <n-form-item label="视频流地址" path="capture_path">
            <n-input v-model:value="formAdd.capture_path" placeholder="请输入视频流的地址"/>
            <n-button strong ghost type="info" @click="connectionTest" :loading="connectionTestLoading">连接测试</n-button>
          </n-form-item>
          <n-form-item label="关联的分组" path="group_id">
            <n-select v-model:value="formAdd.group_id" :options="groupOptions" placeholder="请输入待识别的分组"/>
          </n-form-item>
        </n-form>
      </n-space>

    </n-modal>

    <!-- 任务表格 -->
    <n-data-table
        style="margin-top: 16px"
        :row-key="(row:RowData) => row.id"
        striped
        :columns="columns"
        :data="taskDates"
        size="large"
    />

  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref, onMounted, toRaw, Component} from "vue"
import {NTime, NSpace, NTag, NButton, useMessage, useDialog} from "naive-ui";
import type {DataTableColumns, FormRules, FormInst, FormItemRule} from 'naive-ui'
import {ClipboardTaskAdd24Regular} from '@vicons/fluent';
import {useRouter} from "vue-router";
import {getTasks, deleteTask, addTask} from "@/api/tasks/faceTask.ts";
import {connectionTestApi} from "@/api/cameras/camera.ts";
import {getGroupIds} from "@/api/groups/group";

const defaultRtsp = ref('');
async function loadConfig(){
  try {
    const response = await fetch('/config.json');
    const data = await response.json();
    const {rtsp_path} = data;
    const defaultRtspPath = rtsp_path.find((item: RtspPath) => item.name === 'default')
    defaultRtsp.value = defaultRtspPath ? defaultRtspPath.path : '';
  }
  catch (error) {console.log('LoadConfigError:', error)}
}

onMounted(() => {
  Promise.all([loadTaskData(), loadConfig()])
})

const message = useMessage();
const n_dialog = useDialog();
const router = useRouter();
const alignStyle = 'center';
const formAddRef = ref<FormInst | null>(null);
const showAddModal = ref(false);
const formAddBtnLoading = ref(false);
const connectionTestLoading = ref(false);
const formRemoveBtnLoading = ref(false);
const taskDates = ref([]);
const groupOptions = ref([]);

const rangeShortcuts = {
  "近5分钟": () => {
    const cur = new Date().getTime();
    return [cur, cur + 5 * 60 * 1000]
  },
  "近10分钟": () => {
    const cur = new Date().getTime();
    return [cur, cur + 10 * 60 * 1000]
  },
  "近30分钟": () => {
    const cur = new Date().getTime();
    return [cur, cur + 30 * 60 * 1000]
  },
  "近1小时": () => {
    const cur = new Date().getTime();
    return [cur, cur + 3600 * 1000]
  },
  "近2小时": () => {
    const cur = new Date().getTime();
    return [cur, cur + 2 * 3600 * 1000]
  },
}

const formAdd = reactive({
  name: '',
  time_range: null,
  interval_seconds: 5,
  capture_path: defaultRtsp,
  group_id: null,
  ex_detect: [],
})

type RowData = {
  id: number
  task_token: string;
  name: string;
  start_time: string;
  end_time: string;
  interval_seconds: number;
  status: string;
  capture_path: string;
  ex_detect: Array<string>;
  associated_group_id: number;
  associated_group_name: string;
}

const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: "请输入任务的名称"
  },
  time_range: {
    required: true,
    type: "array",
    trigger: ['blur', 'input'],
    message: "请选择时间范围"
  },
  interval_seconds: {
    required: true,
    type: "number",
    trigger: ['blur', 'input'],
    message: '请输入时间间隔',
  },
  capture_path: {
    key: 'cap',
    required: true,
    trigger: ['blur', 'input'],
    message: "请输入视频流地址",
    // 自行加rtsp、rtmp流格式的校验地址，不然都统一的让后台去连接测试
  },
  group_id: {
    required: true,
    type: "number",
    trigger: ['blur', 'input'],
    message: '请选择关联的分组'
  },
}

const createColumns = ({infoRow, deleteRow}: {
  infoRow: (rowData: RowData) => void
  deleteRow: (rowData: RowData) => void
}): DataTableColumns<RowData> => {
  return [
    {
      title: '任务名称',
      key: 'name',
      width: 120,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '扩展任务',
      key: 'ex_detect',
      width: 120,
      align: alignStyle,
      ellipsis: {tooltip: true},
      render(row: RowData) {
        const exText: string | Component[] = row.ex_detect.length === 0 ? '-' : row.ex_detect.includes('SFAS') ? [h(NTag, {type: 'default'}, {default: () => '静默活体'})] : '-';
        return h(
            NSpace,
            {justify: 'center'},
            {default: () => exText}
        )
      }
    },
    {
      title: '开始时间',
      key: 'start_time',
      width: 150,
      align: alignStyle,
      ellipsis: {tooltip: true},
      render(row: RowData) {
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '结束时间',
      key: 'end_time',
      width: 150,
      align: alignStyle,
      ellipsis: {tooltip: true},
      render(row) {
        return h(NTime, {time: new Date(row.end_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '间隔时间(s)',
      key: 'interval_seconds',
      width: 90,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '视频流地址',
      key: 'capture_path',
      width: 150,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '关联分组',
      key: 'associated_group_name',
      width: 80,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: alignStyle,
      render(row) {
        const statusText =
            row.status === 'Waiting'
                ? '等待中'
                : row.status === 'Running'
                    ? '运行中'
                    : row.status === 'Finished'
                        ? '已完成' : '未知';
        const statusType = row.status === 'Waiting' ? "warning" : row.status === 'Running' ? "success" : row.status === 'Finished' ? "info" : 'error';
        return h(
            NTag,
            {
              type: statusType,
            },
            {
              default: () => statusText,
            }
        );
      }
    },
    {
      title: "操作",
      key: "actions",
      align: 'center',
      width: 160,
      render(row) {
        return h(
            NSpace,
            {
              justify: 'center',
            },
            {
              default: () => [
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      ghost: true,
                      onClick: () => infoRow(row),
                    },
                    {default: () => '详情'}
                ),
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      ghost: true,
                      // loading: formRemoveBtnLoading,
                      onClick: () => deleteRow(row)

                    },
                    {default: () => '删除'}
                )
              ]
            }
        )
      }
    }
  ]
}

const loadTaskData = async () => {
  try {
    const response = await getTasks()
    if (response.status === 200) {
      taskDates.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}

const columns = createColumns({
  infoRow(rowData) {
    // console.log(rowData.task_token)
    router.push({name: 'face-record', params: {token: rowData.task_token}})
  },
  deleteRow(rowData) {
    // console.log(rowData.task_token)
    n_dialog.warning({
      title: '警告',
      content: `您确定删除 ${rowData.name} 的任务记录吗？`,
      positiveText: '确定',
      negativeText: '取消',
      loading: formRemoveBtnLoading.value,
      onPositiveClick: async () => {
        formRemoveBtnLoading.value = true
        try {
          const response = await deleteTask(rowData.task_token);
          if (response.status === 200) {
            message.success('删除成功');
            loadTaskData();
          } else {
          }
        } catch (err: any) {
          // console.log(err)
          message.error("删除失败")
        } finally {
          formRemoveBtnLoading.value = false
        }
      },
      onNegativeClick: () => {
      }
    })
  },
})

const loadGroupData = async () => {
  try {
    const response = await getGroupIds()
    if (response.status === 200) {
      // console.log(response.data)
      groupOptions.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}

function AddTask() {
  showAddModal.value = true
  loadGroupData()
}

// 测试rtsp视频流地址是否可用
async function connectionTest(e:MouseEvent) {
  e.preventDefault();
  connectionTestLoading.value = true;
  await formAddRef.value?.validate(
      async (errors) => {
        if (!errors) {
          await connectionTestApi(formAdd.capture_path)
              .then((res)=>{
                if(res.status === 200){message.success('连接成功')}
              })
              .catch((err)=>{
                message.error('连接失败');
                console.log(err);
              })
          connectionTestLoading.value = false;
        }
      },
      (rule) => {
        return rule?.key === 'cap';
      }
  ).catch((e) => {
    console.log(e)
    connectionTestLoading.value = false;
  })
}

async function confirmAddForm(e: Event) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    await formAddRef.value?.validate(async (errors) => {
      if (!errors) {
        console.log('新单增表验证通过')
        try {
          const response = await addTask(toRaw(formAdd))
          console.log(response)
          if (response.status === 200) {
            message.success('任务添加成功')
            showAddModal.value = false;
            resetFormData();
            loadTaskData();
          }
          formAddBtnLoading.value = false
        } catch (err: any) {
          const er = err.response;
          if (er.status === 409) {
            message.error('新建失败，任务名已存在！')
          } else if (er.status === 410){
            message.error('新建失败，视频流地址无法连接！')
          }
          formAddBtnLoading.value = false
        }
      }
    })
  } catch (err: any) {
    console.log(err)
    formAddBtnLoading.value = false
  }
}

function resetFormData() {
  formAdd.name = '';
  formAdd.time_range = null;
  formAdd.interval_seconds = 5;
  formAdd.capture_path = defaultRtsp;
  formAdd.group_id = null;
  formAdd.ex_detect = [];
}

</script>


<style scoped lang="less">

</style>