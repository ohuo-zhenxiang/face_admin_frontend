<template>
  <div>
    <!--数据card-->
    <n-grid cols="1 s:2 m:3 l:4 xl:4 2xl:4" responsive="screen" :x-gap="12" :y-gap="12">
      <!--人脸库-->
      <n-grid-item>
        <NCard title="人脸库" :segmented="{content: true}" size="medium" :bordered="false"
               :hoverable="true">
          <template #header>
            <div class="flex items-center">
              <n-icon size="32">
                <ContactCardGroup24Regular/>
              </n-icon>
              &nbsp人脸库
            </div>
          </template>
          <template #header-extra>
            <router-link to="/faceDatabase/management" class="flex items-center justify-center">
              <n-icon-wrapper :border-radius="10" color="#18a0581f">
                <n-icon size="32" color="#18a058">
                  <OpenFolder24Filled/>
                </n-icon>
              </n-icon-wrapper>
            </router-link>
          </template>

          <div class="py-1 px-1 flex justify-between">
            <div>
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <CountTo v-else :starVal="0" :endVal="cardData.faceWarehouse.total" class="text-4xl"/>
            </div>
            <div class="text-2xl flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-gradient-text type="success">{{ cardData.faceWarehouse.uploadNum }}</n-gradient-text>&nbsp;&nbsp;/&nbsp;&nbsp;
                <n-gradient-text type="warning">{{ cardData.faceWarehouse.snapshotNum }}</n-gradient-text>
              </template>
            </div>
          </div>

          <div class="py-1 px-1 flex justify-between">
            <div class="text-base">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                人脸总数
              </template>
            </div>
            <div class="text-sn flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-tag type="success" :bordered="false">上传</n-tag>
                <n-tag type="warning" :bordered="false">抓拍</n-tag>
              </template>
            </div>
          </div>
        </NCard>
      </n-grid-item>

      <!--人脸分组-->
      <n-grid-item>
        <NCard title="人脸分组" :segmented="{content: true, footer: true}" size="medium" :bordered="false"
               :hoverable="true">
          <template #header>
            <div class="flex items-center">
              <n-icon size="32">
                <PeopleCommunity24Regular/>
              </n-icon>
              &nbsp人脸分组
            </div>
          </template>
          <template #header-extra>
            <router-link to="/personGroup/basic-group" class="flex items-center">
              <n-icon-wrapper :border-radius="10" color="#18a0581f">
                <n-icon size="32" color="#18a058">
                  <OpenFolder24Filled/>
                </n-icon>
              </n-icon-wrapper>
            </router-link>
          </template>

          <div class="py-1 px-1 flex justify-between">
            <div>
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <CountTo v-else :starVal="0" :endVal="cardData.faceGroup.total" class="text-4xl"/>
            </div>
            <div class="text-2xl flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-gradient-text type="success">{{ cardData.faceGroup.used }}</n-gradient-text>
                &nbsp
              </template>
            </div>
          </div>

          <div class="py-1 px-1 flex justify-between">
            <div class="text-base">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                分组总数
              </template>
            </div>
            <div class="text-sn flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-tag type="success" :bordered="false">已用</n-tag>
              </template>
            </div>
          </div>
        </NCard>
      </n-grid-item>

      <!--任务状态-->
      <n-grid-item>
        <NCard title="" :segmented="{content: true, footer: true}" size="medium" :bordered="false"
               :hoverable="true">
          <template #header>
            <div class="flex items-center">
              <n-icon size="32">
                <TaskListLtr24Filled/>
              </n-icon>
              &nbsp任务状态
            </div>
          </template>
          <template #header-extra>
            <router-link to="/regTask/task-manage" class="flex items-center justify-center">
              <n-icon-wrapper :border-radius="10" color="#18a0581f">
                <n-icon size="32" color="#18a058">
                  <OpenFolder24Filled/>
                </n-icon>
              </n-icon-wrapper>
            </router-link>
          </template>

          <div class="py-1 px-1 flex justify-between">
            <div>
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <CountTo v-else :starVal="0" :endVal="cardData.task.total" class="text-4xl"/>
            </div>
            <div class="text-2xl flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-gradient-text type="info">{{ cardData.task.finished }}</n-gradient-text>
                &nbsp&nbsp;/&nbsp&nbsp;
                <n-gradient-text type="success">{{ cardData.task.running }}</n-gradient-text>
                &nbsp&nbsp;/&nbsp&nbsp;
                <n-gradient-text type="warning">{{ cardData.task.waiting }}</n-gradient-text>
              </template>
            </div>
          </div>

          <div class="py-1 px-1 flex justify-between">
            <div class="text-base">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                任务总数
              </template>
            </div>
            <div class="text-sn flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-tag type="info" :bordered="false">完成</n-tag>
                <n-tag type="success" :bordered="false">运行</n-tag>
                <n-tag type="warning" :bordered="false">等待</n-tag>
              </template>
            </div>
          </div>
        </NCard>
      </n-grid-item>

      <!-- 设备状态 -->
      <n-grid-item>
        <NCard title="设备状态" :segmented="{content: true, footer: true}" size="medium" :bordered="false"
               :hoverable="true">
          <template #header>
            <div class="flex items-center">
              <n-icon size="32">
                <CameraDome24Regular/>
              </n-icon>
              &nbsp设备状态
            </div>
          </template>
          <template #header-extra>
            <router-link to="/cameraSetting/basic-camera" class="flex items-center justify-center">
              <n-icon-wrapper :border-radius="10" color="#18a0581f">
                <n-icon size="32" color="#18a058">
                  <OpenFolder24Filled/>
                </n-icon>
              </n-icon-wrapper>
            </router-link>
          </template>

          <div class="py-1 px-1 flex justify-between">
            <div>
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <CountTo v-else :starVal="0" :endVal="cardData.equipment.total" class="text-4xl"/>
            </div>
            <div class="text-2xl flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-gradient-text type="success">{{ cardData.equipment.normal }}</n-gradient-text>
                &nbsp&nbsp;/&nbsp&nbsp;
                <n-gradient-text type="error">{{ cardData.equipment.fault }}</n-gradient-text>
              </template>
            </div>
          </div>

          <div class="py-1 px-1 flex justify-between">
            <div class="text-base">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                设备总数
              </template>
            </div>
            <div class="text-sn flex items-end">
              <n-skeleton v-if="loading" :width="100" size="medium"/>
              <template v-else>
                <n-tag type="success" :bordered="false">正常</n-tag>
                <n-tag type="error" :bordered="false">故障</n-tag>
              </template>
            </div>
          </div>
        </NCard>
      </n-grid-item>
    </n-grid>

    <!--任务图像预览-->
    <n-grid cols="4" responsive="screen" :x-gap="12" :y-gap="12" class="mt-2">
      <!--实时记录预览-->
      <n-grid-item :span="3">
        <NCard title="实时记录预览" :segmented="{content: true}" :bordered="false" :hoverable="true" size="small">
          <template #header>
            <div class="flex items-center text-lg">
              <n-icon size="32">
                <Image24Regular/>
              </n-icon>
              &nbsp实时记录预览
            </div>
          </template>
          <template #header-extra>
            <div v-show="currentRecordTime" class="text-gray-500">
              记录时间&nbsp:&nbsp
              <n-time format="yyyy/MM/dd HH:mm:ss" :time="formattedTime(currentRecordTime)"/>
            </div>
          </template>
          <div>
            <n-carousel direction="vertical" :show-dots="false" show-arrow>
              <img class="carousel-img flex justify-center" :src="currentImageUrl" alt="">
              <template #arrow>
                <div class="custom-arrow">
                  <button type="button" @click="prevImage" class="custom-arrow--left">
                    <n-icon>
                      <ArrowBack/>
                    </n-icon>
                  </button>
                  <button type="button" @click="nextImage" class="custom-arrow--right">
                    <n-icon>
                      <ArrowForward/>
                    </n-icon>
                  </button>
                </div>
              </template>
            </n-carousel>
          </div>
        </NCard>
      </n-grid-item>

      <!--任务概览-->
      <n-grid-item>
        <NCard title="任务概览" :segmented="{content: true}" :bordered="false" :hoverable="true" size="small">
          <template #header>
            <div class="flex items-center text-lg">
              <n-icon size="32">
                <DocumentBulletList24Regular/>
              </n-icon>
              &nbsp任务概览
            </div>
          </template>
          <template #default>
            <div class="text-sm">
              <n-grid :cols="2" :x-gap="5" :y-gap="8">
                <n-gi :span="2">
                  <n-select placeholder="请选择任务" v-model:value="selectedTaskToken"
                            :render-label="renderTaskLabel"
                            :options="taskOptions"/>
                </n-gi>
                <n-gi>
                  <n-text>状态 :&nbsp&nbsp</n-text>
                  <n-tag v-show="selectedTask.status"
                         :type="selectedTask.status === 'Finished' ? 'info' : selectedTask.status === 'Running' ? 'success' : selectedTask.status === 'Waiting' ? 'warning' : 'default'">
                    {{
                      selectedTask.status === 'Finished' ? '已完成' : selectedTask.status === 'Running' ? '运行中' : selectedTask.status === 'Waiting' ? '等待中' : '未执行'
                    }}
                  </n-tag>
                </n-gi>
                <n-gi class="flex items-center justify-center">间隔 :&nbsp&nbsp{{ selectedTask.interval_seconds }} (s)
                </n-gi>
                <n-gi :span="2">开始 :&nbsp
                  <n-time v-show="selectedTask.start_time" format="yyyy/MM/dd HH:mm:ss"
                          :time="formattedTime(selectedTask.start_time)"/>
                </n-gi>
                <n-gi :span="2">结束 :&nbsp
                  <n-time v-show="selectedTask.end_time" format="yyyy/MM/dd HH:mm:ss"
                          :time="formattedTime(selectedTask.end_time)"/>
                </n-gi>
                <n-gi :span="2">
                  <n-progress type="line" :percentage="currentProgress" :indicator-placement="'inside'"
                              :processing="selectedTask.status ==='Running'"/>
                </n-gi>
              </n-grid>
            </div>
            <div class="overflow-auto hide-scrollbar mt-1 max-h-[55vh]">
              <n-list v-for="(record, index) in recordList" :bordered="false" :clickable="false" :hoverable="true">
                <n-list-item @click="handleRecord(record, index)" :class="{'selected-list-item': index==selectedIndex}">
                  <n-thing :title="`检测到${record.face_count}人，识别身份${record.record_names.length}人`">
                    <template #description>
                      <n-time class="text-xs text-gray-500" format="yyyy/MM/dd HH:mm:ss"
                              :time="formattedTime(record.start_time)"/>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </div>

          </template>
        </NCard>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch, onBeforeUnmount} from "vue";
import {CountTo} from "@/components/CountTo";
import {
  getIsReloading,
  getFaceWarehouseCard,
  getFaceGroupCard,
  getTaskCard,
  getEquipmentCard,
  getRecordList,
  getRecordImage
} from "@/api/overview/overview";
import {getTasks} from "@/api/tasks/task"
import {NIcon, NTag} from "naive-ui";
import {ArrowBack, ArrowForward} from "@vicons/ionicons5";
import defaultImageUrl from '@/assets/images/404.jpg'


import {
  Bookmark24Filled,
  DocumentBulletList24Regular,
  Image24Regular,
  OpenFolder24Filled,
  PeopleCommunity24Regular,
  ContactCardGroup24Regular,
  TaskListLtr24Filled,
  CameraDome24Regular
} from "@vicons/fluent";

const toRefresh = ref(false);
// @ts-ignore
const baseUrl = process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOB_PROD_BASE_URL : import.meta.env.VITE_PRODUCTION_URL;
const loading = ref(false);
const cardData = ref({
  faceWarehouse: {
    total: 0,
    uploadNum: 0,
    snapshotNum: 0
  },
  faceGroup: {
    total: 0,
    used: 0,
  },
  task: {
    total: 0,
    running: 0,
    finished: 0,
    waiting: 0,
  },
  equipment: {
    total: 0,
    normal: 0,
    fault: 0
  },
});

interface RecordList {
  id: number;
  face_count: number;
  record_image_path: string;
  record_info: string;
  record_names: Array<string>;
  start_time: string;
}
const recordList = ref<RecordList[]>([]);
const currentImageUrl = ref(defaultImageUrl);
const currentProgress = ref(0);
const currentRecordTime = ref(null);

const loadRefresh = async () => {
  try {
    const response = await getIsReloading();
    if (response.status === 200) {
      toRefresh.value = response.data.isReloading
    }
  } catch (e) {
    console.log(e)
  }
}

// 加载四个card的数据
const loadFaceWarehouseCard = async () => {
  try {
    const response = await getFaceWarehouseCard()
    if (response.status === 200) {
      Object.assign(cardData.value.faceWarehouse, response.data)
    }
  } catch (error) {
    console.log(error)
  }
}
const loadFaceGroupCard = async () => {
  try {
    const response = await getFaceGroupCard()
    if (response.status === 200) {
      Object.assign(cardData.value.faceGroup, response.data)
    }
  } catch (error) {
    console.log(error)
  }
}
const loadTaskCard = async () => {
  try {
    const response = await getTaskCard()
    if (response.status === 200) {
      Object.assign(cardData.value.task, response.data)
    }
  } catch (error) {
    console.log(error)
  }
}
const loadEquipmentCard = async () => {
  try {
    const response = await getEquipmentCard()
    if (response.status === 200) {
      Object.assign(cardData.value.equipment, response.data)
    }
  } catch (error) {
    console.log(error)
  }
}

interface Task {
  associated_group_id: number;
  associated_group_name: string;
  capture_path: string;
  created_time: string;
  end_time: string;
  id: number;
  interval_seconds: 5;
  name: String;
  start_time: String;
  status: String;
  task_token: String;
}
interface TaskOptions{
  label: string;
  value: string;
  style: {fontSize: number};
  status: string;
}

const tasks = ref<Task[]>([])
const taskOptions = ref<TaskOptions[]>([])
const selectedTaskToken = ref<string | null>(null);
const selectedIndex = ref(0);

// 加载可选择的任务的列表，包括加载任务的状态项。。。
const loadTaskData = async () => {
  try {
    const response = await getTasks()
    if (response.status === 200) {
      tasks.value = response.data.items
      taskOptions.value = tasks.value.map((task) => ({
        label:  String(task.name),
        value: String(task.task_token),
        style: {
          // color: task.status === 'Finished' ? '#2080f0': task.status === 'Running' ? '#18a058' : '#f0a020',
          fontSize: 24,
          // fontWeight: 'bold',
        },
        status: String(task.status),
      }))
    }
  } catch (error) {
    console.log(error)
  }
}
const loadAllData = async () => {
  await Promise.all([
    loadRefresh(),
    loadFaceWarehouseCard(),
    loadFaceGroupCard(),
    loadTaskCard(),
    loadEquipmentCard(),
    loadTaskData()])
}

onMounted(async ()=> {
  tasks.value = [];
  taskOptions.value = [];
  await loadAllData();
});



const selectedTask = computed(() => {
  const task = tasks.value.find(task => task.task_token === selectedTaskToken.value)
  if (task) {
    return task;
  } else {
    return {
      associated_group_id: 0,
      associated_group_name: '',
      capture_path: '',
      created_time: '',
      end_time: '',
      id: 0,
      interval_seconds: 5,
      name: '',
      start_time: '',
      status: '',
      task_token: '',
    }
  }
})

const loadRecordList = async () => {
  try {
    const response = await getRecordList(selectedTaskToken.value)
    if (response.status === 200) {
      recordList.value = response.data;
      if (selectedTask.value.status === "Finished") {
        // console.log("Finished")
        currentProgress.value = 100;
      } else if (selectedTask.value.status === "Running" && recordList.value) {
        const c = new Date(recordList.value[recordList.value.length - 1].start_time);
        const s = new Date(selectedTask.value.start_time as string);
        const e = new Date(selectedTask.value.end_time as string);
        if (!isNaN(c.getTime()) && !isNaN(s.getTime()) && !isNaN(e.getTime())){
          const diff = ((c.getTime()- s.getTime()) / (e.getTime() - s.getTime()) * 100).toFixed(2);
          currentProgress.value = parseFloat(diff)
        }else{
          console.error("Invalid date format")
        }
      }
    } else {
      console.error(response.status)
    }
  } catch (error) {
    recordList.value = [];
    currentProgress.value = 0;
    console.log(error)
  }
};
watch(selectedTaskToken, async () => {
  selectedIndex.value = 0;
  currentRecordTime.value = null;
  await loadRecordList();
  if (recordList.value.length != 0) {
    await handleRecord(recordList.value[0], 0)
  } else {
    currentImageUrl.value = defaultImageUrl
  }
})

watch(toRefresh, (newValue) => {
  if (newValue) {
    startPolling();
  } else {
    stopPolling();
  }
});
// 创建定时器
const pollingTimer = ref<null|NodeJS.Timeout>(null);
const startPolling = () => {
  pollingTimer.value = setInterval(async () => {
    if (selectedTask.value.status === "Finished") {
      currentProgress.value = 100;
      await Promise.all([loadRefresh(), loadTaskCard(), loadTaskData()])
    } else if (selectedTaskToken.value === null) {
      await Promise.all([loadRefresh(), loadTaskCard(), loadTaskData()])
    } else if (selectedTask.value.status === "Running") {
      await Promise.all([loadRefresh(), loadTaskData(), loadTaskCard(), loadRecordList()])
    }
  }, 5000);
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
}

// 在组件销毁时停止轮询
onBeforeUnmount(stopPolling);


// function handleRecord(record) {
//   // currentImageUrl.value = `${baseUrl}/${record.record_image_path}`;
//   currentRecordTime.value = record.start_time;
//
//   const image = new Image();
//   image.src = `${baseUrl}/${record.record_image_path}`;
//
//   image.onload = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = image.width;
//     canvas.height = image.height;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(image, 0, 0);
//
//     ctx.strokeStyle = 'red';
//     ctx.lineWidth = 2;
//     ctx.strokeRect(50, 50, 100, 100);
//     const dataUrl = canvas.toDataURL('image/jpeg');
//     currentImageUrl.value = dataUrl;
//     console.log(currentImageUrl.value)
//   }
// }

async function handleRecord(record, index) {
  selectedIndex.value = index;
  currentRecordTime.value = record.start_time;
  const response = await getRecordImage(record.id)
  currentImageUrl.value = `data:image/jpeg;base64,${response.data.image_data}`
}

async function prevImage() {
  if (selectedIndex.value > 0) {
    // console.log("prev")
    await handleRecord(recordList.value[selectedIndex.value - 1], selectedIndex.value - 1)
  }
}

async function nextImage() {
  if (selectedIndex.value < recordList.value.length - 1) {
    // console.log("next")
    await handleRecord(recordList.value[selectedIndex.value + 1], selectedIndex.value + 1)
  }
}

function formattedTime(dateTimeString): Date {
  const dateTime = new Date(dateTimeString);
  if (!isNaN(dateTime.getTime())) {
    return dateTime;
  } else {
    return new Date();
  }
}

// 定义格式化下拉select的选项的标签函数
const renderTaskLabel = (option) => {
  if (option.type === 'group') {
    return option.label + '(Cool!)'
  } else {
    return [
      h(
          NIcon,
          {
            color: option.status === 'Finished' ? '#2080f0' : option.status === 'Running' ? '#18a058' : '#f0a020',
            style: {
              verticalAlign: '-0.15em',
              marginRight: '4px',
            },
          },
          {
            default: () => h(Bookmark24Filled)
          },
      ),
      option.label as string,
    ]
  }
}
</script>

<style scoped lang="less">
.carousel-img {
  object-fit: cover;
}

.hide-scrollbar::-webkit-scrollbar {
  width: 0.25rem; /* 设置滚动条宽度为 0 */
}

.hide-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent; /* 隐藏滑块背景颜色 */
}

.selected-list-item {
  background: #e3f2fd;
  color: black;


  ::v-deep(.n-thing-main .n-thing-header .n-thing-header__title) {
    color: black;
  }

  //&:hover {
  //  background: #90caf9;
  //}
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: rgba(32, 128, 240, 0.18);
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}
</style>


<!--currentRecordTime.value = record.start_time-->
<!--const stage = new Konva.Stage({-->
<!--container: "konva-container",-->
<!--width: 1920,-->
<!--height: 1080,-->
<!--});-->
<!--const layer = new Konva.Layer();-->
<!--stage.add(layer);-->
<!--const imageObject = new Image();-->
<!--imageObject.src = `${baseUrl}/${record.record_image_path}`;-->
<!--imageObject.onload = () => {-->
<!--const image = new Konva.Image({-->
<!--image: imageObject-->
<!--});-->
<!--layer.add(image);-->
<!--const rect = new Konva.Rect({-->
<!--x: 50,-->
<!--y: 50,-->
<!--width: 100,-->
<!--height: 100,-->
<!--fill: 'red',-->
<!--});-->
<!--layer.add(rect)-->
<!--layer.toDataURL({-->
<!--callback: (dataUrl) => {-->
<!--currentImageUrl.value = dataUrl;-->
<!--}-->
<!--})-->

<!--}-->