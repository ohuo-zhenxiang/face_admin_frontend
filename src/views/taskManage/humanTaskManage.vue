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

    <!--新建任务的model-->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新建人体检测任务">
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
          <n-form-item label="检测类型" path="type">
            <n-checkbox-group v-model:value="formAdd.task_expands" size="large">
              <n-space>
                <n-checkbox value="person" :disabled="true">人体</n-checkbox>
                <n-checkbox value="pose">姿态</n-checkbox>
                <n-checkbox value="smoke">吸烟</n-checkbox>
                <n-checkbox value="phone">打电话</n-checkbox>
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
            <n-input v-model:value="formAdd.capture_path" placeholder="请输入视频流地址"/>
            <n-button strong ghost type="info" @click="connectionTest" :loading="connectionTestLoading">连接测试</n-button>
          </n-form-item>
        </n-form>
      </n-space>
    </n-modal>

    <!--任务信息表格-->
    <n-data-table
        style="margin-top:16px;"
        :row-key="(row:RowData)=>row.id"
        striped
        :columns="columns"
        :data="taskDates"
        size="large"
    />
  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref, onMounted, Component} from "vue";
import {NTime, NSpace, NTag, NButton, useMessage, useDialog, DataTableColumns} from "naive-ui";
import {ClipboardTaskAdd24Regular} from '@vicons/fluent';
import {useRouter} from "vue-router";
import type {FormRules, FormInst} from "naive-ui";
import {getHumanTasks, addHumanTask, deleteHumanTask} from "@/api/tasks/humanTask.ts";
import {connectionTestApi} from "@/api/cameras/camera";
import {usePermission} from '@/permission';

const defaultRtsp = ref('');

type RtspPath = {
  path: string;
  name: string;
}

onMounted(async () => {
  await Promise.all([loadTaskData(), loadConfig()])
})

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


const message = useMessage();
const n_dialog = useDialog();
const router = useRouter();
const {hasPermission} = usePermission();

const formAddRef = ref<FormInst | null>(null);
const alignStyle = 'center';
const showAddModal = ref(false);
const formAddBtnLoading = ref(false);
const connectionTestLoading = ref(false);
const taskDates = ref([]);

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
  task_expands: ['person'],
})

type RowData = {
  id: number
  task_token: string
  expand_tasks: Array<string> | []
  task_name: string
  start_time: any
  end_time: any
  interval_seconds: number
  status: string
  capture_path: string
  created_time: string
}

const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入任务名称'
  },
  time_range: {
    required: true,
    type: "array",
    trigger: ['blur', 'input'],
    message: '请选择时间范围'
  },
  interval_seconds: {
    required: true,
    type: "number",
    trigger: ['blur', 'input'],
    message: '请输入时间间隔',
  },
  capture_path: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入视频流地址'
  }
}

enum TaskType {
  pose = 'pose',
  person = 'person',
  smoke = 'smoke',
  phone = 'phone',
}

const taskTypeMapping: Record<TaskType, string> = {
  [TaskType.pose]: '姿态',
  [TaskType.person]: '人体',
  [TaskType.smoke]: '吸烟',
  [TaskType.phone]: '打电话',
}

const createColumns = ({infoRow, deleteRow}: {
  infoRow: (rowData: RowData) => void
  deleteRow: (rowData: RowData) => void
}): DataTableColumns<RowData> => {
  return [
    {
      title: '任务名称',
      key: 'task_name',
      width: 80,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '检测类型',
      key: 'expand_tasks',
      width: 200,
      align: alignStyle,
      render(row: RowData) {
        const taskText: Component[] = [h(NTag, {type: 'default'}, {default: () => taskTypeMapping['person']})]
        if (row.expand_tasks.length > 0) {
          const expand_tasks = [...row.expand_tasks];
          expand_tasks.sort().forEach(task => {
            const taskName: string = taskTypeMapping[task as TaskType] || '';
            taskText.push(h(NTag, {type: 'default'}, {default: () => taskName}))
          });
        }
        return h(
            NSpace,
            {justify: 'center'},
            {default: () => taskText}
        )
      }
    },
    {
      title: '开始时间',
      key: 'start_time',
      width: 120,
      align: alignStyle,
      ellipsis: {tooltip: true},
      render(row) {
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '结束时间',
      key: 'end_time',
      width: 120,
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
      width: 180,
      align: alignStyle,
      ellipsis: {tooltip: true},
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      align: alignStyle,
      render(row) {
        const statusText = row.status === 'Waiting' ? '等待中' : row.status === 'Running' ? '运行中' : row.status === 'Finished' ? '已完成' : '未知';
        const statusType = row.status === 'Waiting' ? 'warning' : row.status === 'Running' ? 'success' : row.status === 'Finished' ? 'info' : 'error';
        return h(
            NTag,
            {type: statusType,},
            {default: () => statusText,}
        )
      }
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: 140,
      render(row) {
        return h(
            NSpace,
            {justify: 'center',},
            {default: () => [
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
                hasPermission('admin') ? h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      ghost: true,
                      onClick: () => deleteRow(row)
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

const loadTaskData = async () => {
  try {
    const response = await getHumanTasks()
    if (response.status === 200) {
      taskDates.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}

const columns = createColumns({
  infoRow(rowData: RowData) {
    router.push({name: 'human-record', params: {token: rowData.task_token}})
  },
  deleteRow(rowData: RowData) {
    n_dialog.warning({
      title: '警告',
      content: `您确定删除"${rowData.task_name}"的任务记录吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteHumanTask(rowData.task_token);
          if (response.status === 200) {
            message.success('删除成功');
            await loadTaskData();
          }
        } catch (err: any) {
          message.error("删除失败")
        }
      },
      onNegativeClick: () => {
      },
    })
  }
})

const AddTask = () => {
  showAddModal.value = true;
}

// 测试rtsp视频流地址是否可用
async function connectionTest(e:MouseEvent) {
  e.preventDefault();
  connectionTestLoading.value = true;
  await formAddRef.value?.validate(
      async (errors) => {
        if (!errors) {
          await connectionTestApi(unref(formAdd.capture_path))
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

async function confirmAddForm(e: MouseEvent) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    await formAddRef.value?.validate(async (errors) => {
      if (!errors) {
        console.log('新增表单验证通过')
        try {
          const response = await addHumanTask(toRaw(formAdd))
          if (response.status === 200) {
            message.success('任务添加成功')
            showAddModal.value = false;
            await loadTaskData();
            resetFormAdd();
          }
          formAddBtnLoading.value = false
        } catch (err: any) {
          const er = err.response;
          if (er.status === 409) {
            message.error('新建失败，任务名已存在！')
          } else if (er.status === 410){
            message.error('新建失败，视频流地址无法连接！')
          } else {
            console.log(er)
          }
          formAddBtnLoading.value = false
        }
      } else {
        message.error('表单校验未通过')
      }
    })
  } catch (err: any) {
    console.log(err)
    formAddBtnLoading.value = false;
  }
}

function resetFormAdd() {
  formAdd.name = '';
  formAdd.time_range = null;
  formAdd.interval_seconds = 5;
  formAdd.capture_path = defaultRtsp.value;
  formAdd.task_expands = ['person']
}

</script>


<style scoped lang="less">

</style>