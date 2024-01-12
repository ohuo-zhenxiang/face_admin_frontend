<template>
  <n-card>
    <n-page-header subtitle="返回" @back="handleBack">
      <n-grid :cols="9" responsive="screen" x-gap="10">
        <n-gi :span="1">
          <n-statistic label="任务名称">
            <template #prefix>
              <n-icon>
                <ClipboardTask24Regular/>
              </n-icon>
            </template>
            <template #default>
              <n-ellipsis style="max-width: 80px">
                {{pageHeaderData.task_name}}
              </n-ellipsis>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi :span="2">
          <n-statistic label="检测类型">
            <template #default>
              <n-space inline>
                <n-tag type="default" v-for="tag in pageHeaderData.expand_tasks" :key="tag" size="medium">
                  {{ taskTypeMapping[tag as TaskType] }}
                </n-tag>
              </n-space>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi :span="1">
          <n-statistic label="任务状态" :value="statusText"/>
        </n-gi>
        <n-gi :span="1">
          <n-statistic label="间隔时长" :value="`${pageHeaderData.interval_seconds}秒`">
            <template #prefix>
              <n-icon>
                <Timer24Regular/>
              </n-icon>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi :span="2">
          <n-statistic label="开始时间">
            <template #default>
              <n-time v-show="pageHeaderData.start_time" format="yyyy/MM/dd HH:mm:ss"
                      :time="formattedTime(pageHeaderData.start_time)"/>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi :span="2">
          <n-statistic label="结束时间">
            <template #default>
              <n-time v-show="pageHeaderData.end_time" format="yyyy/MM/dd HH:mm:ss"
                      :time="formattedTime(pageHeaderData.end_time)"/>
            </template>
          </n-statistic>
        </n-gi>
      </n-grid>
    </n-page-header>

    <n-data-table
        remote
        style="margin-top: 20px"
        :row-key="(row:any)=>row.id"
        striped
        :columns="columns"
        :data="recordDates"
        :pagination="paginationReactive"
    />

    <!--图片预览对话框-->
    <n-modal ref="AbaAba" v-model:show="isPreviewOpen" title="记录图像预览" preset="dialog"
             style="width: 70%;height: 60%">
      <div style="display: flex;justify-content:space-around;align-items:flex-start;">
        <div>
          <v-stage :config="{width:1000, height: 618}">
            <v-layer :scaleX="0.55" :scaleY="0.55">
              <v-image v-if="showImage" :image="curImg"/>
              <!--绘制矩形框-->
              <template v-for="human in boundingBoxes">
                <v-rect
                    :config="{
                    x: human.person_box[0],
                    y: human.person_box[1],
                    width: human.person_box[2]-human.person_box[0],
                    height: human.person_box[3]-human.person_box[1],
                    stroke: 'rgb(0,255,0)',
                    strokeWidth: 4,
                    shadowBlur: 10,
                    }"
                />
                <template v-if="human.person_behaviors">
                  <v-rect v-if="human.person_behaviors.smoking.length > 0 && pageHeaderData.expand_tasks.includes('smoke')"
                          :config="{
                      x: human.person_behaviors.smoking[0].behavior_box[0],
                      y: human.person_behaviors.smoking[0].behavior_box[1],
                      width: human.person_behaviors.smoking[0].behavior_box[2]-human.person_behaviors.smoking[0].behavior_box[0],
                      height: human.person_behaviors.smoking[0].behavior_box[3]-human.person_behaviors.smoking[0].behavior_box[1],
                      stroke: 'rgb(255,0,0)',
                      strokeWidth: 4,
                      shadowBlur: 10,
                      }"
                  />
                  <v-rect v-if="human.person_behaviors.calling.length > 0 && pageHeaderData.expand_tasks.includes('phone')"
                          :config="{
                      x: human.person_behaviors.calling[0].behavior_box[0],
                      y: human.person_behaviors.calling[0].behavior_box[1],
                      width: human.person_behaviors.calling[0].behavior_box[2]-human.person_behaviors.calling[0].behavior_box[0],
                      height: human.person_behaviors.calling[0].behavior_box[3]-human.person_behaviors.calling[0].behavior_box[1],
                      stroke: 'rgb(0,0,255)',
                      strokeWidth: 4,
                      shadowBlur: 10,
                      }"
                  />
                </template>
              </template>
            </v-layer>
          </v-stage>
        </div>
      </div>

      <div class="preview-nav">
        <n-button @click="showPrevImage" :disabled="currentIndex === 0">上一条</n-button>
        <n-button @click="showNextImage" :disabled="currentIndex === recordDates.length - 1">下一条</n-button>
      </div>
      <!--      <template #footer>-->
      <!--        <n-button @click="isPreviewOpen=false">关闭</n-button>-->
      <!--      </template>-->
    </n-modal>
  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref, unref, onMounted} from "vue";
import {NButton, NTime, NText} from "naive-ui";
import type {DataTableBaseColumn} from 'naive-ui';
import {useRoute} from "vue-router";
import {getHumanRecords, getRecordPoseImage} from "@/api/tasks/humanRecord.ts";
import {getHumanTaskByToken} from "@/api/tasks/humanTask.ts";
import {ClipboardTask24Regular, Timer24Regular} from '@vicons/fluent';

const boundingBoxes = ref<BoundingBox[]>([])

type Box = [number, number, number, number]

interface Behavior {
  behavior_box: Box;
  behavior_score: number;
  behavior_type: string;
}

interface PersonBehavior {
  calling: Behavior[];
  smoking: Behavior[];
}

interface BoundingBox {
  person_box: Box;
  person_score: string;
  person_id: string;
  person_behaviors?: PersonBehavior;
}

interface RecordInfo {
  humans: BoundingBox[];
  humans_count: number;
  task_status: string;
}

const showImage = ref(false);
const route = useRoute();
const alignStyle = 'center';
const recordDates = ref<RowData[]>([]);
const baseUrl = process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOB_PROD_BASE_URL : import.meta.env.VITE_PRODUCTION_URL

const isPreviewOpen = ref(false);
const currentImage = ref('');  // 当前预览图像的URL
const currentIndex = ref(0);  // 当前预览的记录索引
const currentDetected = ref(0);  // 当前预览检测到人体的数量

type RowData = {
  id: number,
  human_count: number,
  record_image_path: string,
  record_info: string,
  start_time: string,
}

function handleBack() {
  window.history.back();
}

const createColumns = ({infoRow}: {
  infoRow: (rowData: RowData) => void
}): DataTableBaseColumn<RowData>[] => {
  return [
    {
      title: '检测时间',
      key: 'start_time',
      width: 100,
      align: alignStyle,
      render(row: RowData) {
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '人数检测结果',
      key: 'human_count',
      width: 100,
      align: alignStyle,
    },
    {
      title: '行为检测结果',
      key: 'record_info',
      width: 100,
      align: alignStyle,
      render(row: RowData) {
        return CountBehaviors(row)
      }
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: 100,
      render(row) {
        return [
          h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => infoRow(row),
              },
              {default: () => '详情'}
          )
        ]
      }
    }
  ]
}

const paginationReactive = reactive({
  page: 1,
  pageSize: 25,
  showSizePicker: true,
  pageCount: 0,
  itemCount: 0,
  pageSizes: [25, 50, 100],
  prefix({itemCount}) {
    return `共计：${itemCount} 条记录`
  },
  onChange: (page: number) => {
    paginationReactive.page = page;
    loadRecordData();
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize;
    paginationReactive.page = 1;
    loadRecordData();
  }
})

interface PageHeaderData {
  task_name: string,
  expand_tasks: string[],
  capture_path: string,
  interval_seconds: number,
  status: string,
  start_time: string,
  end_time: string,
}

const pageHeaderData = reactive<PageHeaderData>({
  task_name: '',
  expand_tasks: [],
  capture_path: '',
  interval_seconds: 0,
  status: '',
  start_time: '',
  end_time: '',
})

const statusText = computed(() => {
  switch (pageHeaderData.status) {
    case 'Running':
      return '运行中';
    case 'Waiting':
      return '等待中';
    case 'Finished':
      return '已完成';
    default:
      return '未知';
  }
})


const loadTaskData = async () => {
  try {
    const response = await getHumanTaskByToken(route.params.token as string)
    if (response.status === 200) {
      response.data.expand_tasks.push('person')
      response.data.expand_tasks.sort()
      Object.assign(pageHeaderData, response.data)
    }
  } catch (e) {
    console.log(e)
  }
}

const loadRecordData = async () => {
  try {
    const response = await getHumanRecords(route.params.token as string, paginationReactive.page, paginationReactive.pageSize)
    if (response.status === 200) {
      recordDates.value = response.data.items;
      paginationReactive.pageCount = response.data.pages;
      paginationReactive.itemCount = response.data.total;
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  Promise.all([loadRecordData(), loadTaskData()])
})

async function handleRecord(id:number){
  const currentTasks: Array<string> = [...pageHeaderData.expand_tasks]
  if (currentTasks.includes('pose')){
    const response = await getRecordPoseImage(id);
    return `data:image/jpeg;base64,${response.data.image_data}`
  } else {
    return currentImage.value
  }
}

const curImg = ref(new Image());
const columns = createColumns({
  async infoRow(rowData:RowData) {
    const recordInfo:RecordInfo = JSON.parse(rowData.record_info);

    currentImage.value = `${baseUrl}/${rowData.record_image_path}`;
    currentIndex.value = unref(recordDates).findIndex(record => record.id === rowData.id);
    currentDetected.value = unref(rowData).human_count;

    curImg.value.src = await handleRecord(rowData.id);

    boundingBoxes.value = recordInfo.humans;
    // 监听图加载完成
    curImg.value.onload = () => {
      showImage.value = true;
      isPreviewOpen.value = true;
    }
  }
})

// 格式化时间显示
function formattedTime(dateTimeString: string) {
  const dateTime = new Date(dateTimeString);
  if (!isNaN(dateTime.getTime())) {
    return dateTime;
  } else {
    return new Date();
  }
}


// 显示上一条记录的图片
async function showPrevImage() {
  if (currentIndex.value > 0) {
    showImage.value = false;
    currentIndex.value--;
    currentImage.value = `${baseUrl}/${unref(recordDates)[currentIndex.value].record_image_path}`;
    currentDetected.value = unref(recordDates)[currentIndex.value].human_count
    const recordInfo = JSON.parse(unref(recordDates)[currentIndex.value].record_info);
    boundingBoxes.value = recordInfo.humans

    curImg.value.src = await handleRecord(unref(recordDates)[currentIndex.value].id);
    curImg.value.onload = () => {
      showImage.value = true;
    }
  }
}

// 显示下一条记录的图片
async function showNextImage() {
  if (currentIndex.value < unref(recordDates).length - 1) {
    showImage.value = false
    currentIndex.value++;
    currentImage.value = `${baseUrl}/${unref(recordDates)[currentIndex.value].record_image_path}`;
    currentDetected.value = unref(recordDates)[currentIndex.value].human_count
    const recordInfo = JSON.parse(unref(recordDates)[currentIndex.value].record_info);
    boundingBoxes.value = recordInfo.humans

    curImg.value.src = await handleRecord(unref(recordDates)[currentIndex.value].id);
    curImg.value.onload = () => {
      showImage.value = true;
    }
  }
}

function CountBehaviors(row: RowData) {
  const recordInfo = JSON.parse(row.record_info).humans;
  const currentTasks: Array<string> = [...pageHeaderData.expand_tasks]
  currentTasks.shift()
  let callingCount: number = 0
  let smokingCount: number = 0
  if ((currentTasks.includes('smoke') || currentTasks.includes('phone')) && recordInfo) {
    recordInfo.forEach((item: BoundingBox, index: number) => {
      if (item.person_behaviors.calling.length > 0) {
        callingCount++;
      }
      if (item.person_behaviors.smoking.length > 0) {
        smokingCount++;
      }
    })
    return h(NText, {}, {
      default: () => generateDetectedMessage(currentTasks,
          {
            calling: callingCount,
            smoking: smokingCount
          })
    })
  }
  return h(NText, {}, {default: () => '-'})
}

interface BehaviorCounts {
  smoking: number;
  calling: number;
}

function generateDetectedMessage(currentTask: string[], behaviorCounts: BehaviorCounts): string {
  let message: string = '当前检测到：';
  if (currentTask.includes('smoke')) {
    message += `吸烟${behaviorCounts.smoking}人；`
  }

  if (currentTask.includes('phone')) {
    message += `打电话${behaviorCounts.calling}人；`
  }
  return message;
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
</script>


<style scoped lang="less">
.preview-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
</style>