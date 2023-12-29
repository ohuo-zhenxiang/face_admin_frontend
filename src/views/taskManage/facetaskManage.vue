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
        <n-form :model="formAdd" ref="formAddRef">
          <n-form-item label="任务名称" path="name">
            <n-input v-model:value="formAdd.name"/>
          </n-form-item>
          <n-form-item label="时间范围" path="description">
            <n-date-picker v-model:value="formAdd.time_range" type="datetimerange" :shortcuts="rangeShortcuts"/>
          </n-form-item>
          <n-form-item label="时间间隔(s)" path="description">
            <n-input-number v-model:value="formAdd.interval_seconds" placeholder="5" :min="5"/>
          </n-form-item>
          <n-form-item label="视频流地址">
            <n-input v-model:value="formAdd.capture_path"/>
          </n-form-item>
          <n-form-item label="关联的分组">
            <n-select v-model:value="formAdd.group_id" :options="groupOptions" />
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
import {h, reactive, ref, onMounted, toRaw} from "vue"
import {NTime, NSpace, NTag, NButton, useMessage, useDialog} from "naive-ui";
import type {DataTableColumns} from 'naive-ui'
import {ClipboardTaskAdd24Regular} from '@vicons/fluent'
import {useRouter} from "vue-router"
import {getTasks, deleteTask, addTask} from "@/api/tasks/faceTask.ts"
import {getGroupIds} from "@/api/groups/group"


const message = useMessage();
const n_dialog = useDialog();
const router = useRouter();
const alignStyle = 'center';
const showAddModal = ref(false);
const formAddBtnLoading = ref(false);
const taskDates = ref([]);
const groupOptions = ref([]);

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
  group_id: null,
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
      key: 'name',
      width: 120,
      align: alignStyle,
    },
    // {
    //   title: '任务token',
    //   key: 'task_token',
    //   width: 100,
    //   align: alignStyle,
    // },
    {
      title: '开始时间',
      key: 'start_time',
      width: 150,
      align: alignStyle,
      render(row){
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '结束时间',
      key: 'end_time',
      width: 150,
      align: alignStyle,
      render(row){
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
      title: '关联分组',
      key: 'associated_group_name',
      width: 80,
      align: alignStyle,
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
      // console.log(response.data.items)
      taskDates.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}
onMounted(loadTaskData)

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
      onPositiveClick: async () => {
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

async function confirmAddForm(e:Event) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    const response = await addTask(toRaw(formAdd))
    if (response.status === 200) {
      message.success('任务添加成功')
      showAddModal.value = false;
      resetFormData();
      loadTaskData();
    }
  } catch(err: any){
    const er = err.response;
    if (er.status === 409){
      message.error('任务名已存在')
    }
  } finally {
    formAddBtnLoading.value = false
  }
}

function resetFormData() {
  formAdd.name = '';
  formAdd.time_range = null;
  formAdd.interval_seconds = 5;
  formAdd.capture_path = 'rtsp://192.168.130.182:554';
  formAdd.group_id = null;
}

</script>


<style scoped lang="less">

</style>