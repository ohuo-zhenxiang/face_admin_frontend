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
          <n-button type="info" :loading="formAddBtnLoading" @click="confirmAddForm">确认</n-button>
        </n-space>
      </template>
      <n-space style="margin-top: 14px">
        <n-form :model="formAdd" ref="formAddRef">
          <n-form-item label="任务名称" path="name">
            <n-input v-model:value="formAdd.name"/>
          </n-form-item>
          <n-form-item label="时间范围" path="timeframe">
            <n-date-picker v-model:value="formAdd.time_range" type="datetimerange" :shortcuts="rangeShortcuts"/>
          </n-form-item>
          <n-form-item label="时间间隔(s)" path="interval_seconds">
            <n-input-number v-model:value="formAdd.interval_seconds" placeholder="5" :min="5"/>
          </n-form-item>
          <n-form-item label="视频流地址" path="capture_path">
            <n-input v-model:value="formAdd.capture_path"/>
          </n-form-item>
        </n-form>
      </n-space>
    </n-modal>

    <!--任务信息表格-->
    <n-data-table
        style="margin-top:16px;"
        :row-key="(row)=>row.id"
        striped
        :columns="columns"
        :data="taskDates"
        size="large"
    />
  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref, onMounted} from "vue";
import {NTime, NSpace, NTag, NButton, useMessage, useDialog} from "naive-ui";
import {ClipboardTaskAdd24Regular} from '@vicons/fluent';
import {useRouter} from "vue-router";
import {getHumanTasks, getHumanTaskByToken, addHumanTask, deleteHumanTask} from "@/api/tasks/humanTask.ts";

const message = useMessage();
const n_dialog = useDialog();
const router = useRouter();
const alignStyle = 'center';
const showAddModal = ref(false);
const formAddBtnLoading = ref(false);
const taskDates = ref([]);

const rangeShortcuts = {
  近5分钟: () => {
    const cur = new Date().getTime();
    return [cur, cur + 5 * 60 * 1000]
  },
  近10分钟: () => {
    const cur = new Date().getTime();
    return [cur, cur + 10 * 60 * 1000]
  },
  近30分钟: () => {
    const cur = new Date().getTime();
    return [cur, cur + 30 * 60 * 1000]
  },
  近1小时: () => {
    const cur = new Date().getTime();
    return [cur, cur + 3600 * 1000]
  },
  近2小时: () => {
    const cur = new Date().getTime();
    return [cur, cur + 2 * 3600 * 1000]
  },
}

const formAdd = reactive({
  name: '',
  time_range: null,
  interval_seconds: 5,
  capture_path: 'rtsp://192.168.130.182:554',
})

type RowData = {
  id: number
  task_token: string
  name: string
  start_time: any
  end_time: any
  interval_seconds: number
  status: string
  capture_path: string
}

const createColumns = ({infoRow, deleteRow}: {
  infoRow: (rowData: RowData) => void
  deleteRow: (rowData: RowData) => void
}): DataTableColumns<RowData> => {
  return [
    {
      title: '任务名称',
      key: 'task_name',
      width: 120,
      align: alignStyle,
    },
    {
      title: '开始时间',
      key: 'start_time',
      width: 150,
      align: alignStyle,
      render(row) {
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '结束时间',
      key: 'end_time',
      width: 150,
      align: alignStyle,
      render(row) {
        return h(NTime, {time: new Date(row.end_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '间隔时间(s)',
      key: 'interval_seconds',
      width: 90,
      align: alignStyle,
    },
    {
      title: '视频流地址',
      key: 'capture_path',
      width: 200,
      align: alignStyle,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: alignStyle,
      render(row) {
        const statusText = row.status === 'Waiting' ? '等待中' : row.status === 'Running' ? '运行中' : row.status === 'Finished' ? '已完成' : '未知';
        const statusType = row.status === 'Waiting' ? 'warning' : row.status === 'Running' ? 'success' : row.status === 'Finished' ? 'info' : 'error';
        return h(
            NTag,
            {
              type: statusType,
            },
            {
              default: () => statusText,
            }
        )
      }
    },
    {
      title: '操作',
      key: 'actions',
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
    const response = await getHumanTasks()
    if (response.status === 200) {
      taskDates.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}
onMounted(loadTaskData)

const columns = createColumns({
  infoRow(rowData) {
    router.push({name: 'human-record', params: {token: rowData.task_token}})
  },
  deleteRow(rowData) {
    n_dialog.warning({
      title: '警告',
      constent: `您确定删除 ${rowData.name} 的任务记录吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteHumanTask(rowData.task_token);
          if (response.status === 200) {
            message.success('删除成功');
            loadTaskData();
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

async function confirmAddForm(e) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    const response = await addHumanTask(toRaw(formAdd))
    if (response.status === 200) {
      message.success('任务添加成功')
      showAddModal.value = false;
      loadTaskData();
      resetFormAdd();
    }
  } catch (err: any) {
    const er = err.response;
    if (er.status === 409) {
      message.error('任务名已存在')
    }
  } finally {
    formAddBtnLoading.value = false;
  }
}

function resetFormAdd(){
  formAdd.name = '';
  formAdd.time_range = null;
  formAdd.interval_seconds = 5;
  formAdd.capture_path = 'rtsp://192.168.130.182:554';
}

</script>


<style scoped lang="less">

</style>