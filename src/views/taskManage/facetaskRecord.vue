<template>
  <n-card>
    <n-page-header subtitle="返回" @back="handleBack">
      <n-grid :cols="5" responsive="screen">
        <n-gi>
          <n-statistic label="任务名称" :value="pageHeaderData.name">
            <template #prefix>
              <n-icon>
                <ClipboardTask24Regular/>
              </n-icon>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="任务状态" :value="statusText">
            <!--            <template #default>-->
            <!--              <n-tag size="medium" :type="statusTagType">-->
            <!--                {{ statusText }}-->
            <!--              </n-tag>-->
            <!--            </template>-->
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="间隔时长" :value="`${pageHeaderData.interval_seconds}秒`">
            <template #prefix>
              <n-icon>
                <Timer24Regular/>
              </n-icon>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="开始时间">
            <template #default>
              <n-time v-show="pageHeaderData.start_time" format="yyyy/MM/dd HH:mm:ss"
                      :time="formattedTime(pageHeaderData.start_time)"/>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="结束时间">
            <template #default>
              <n-time v-show="pageHeaderData.end_time" format="yyyy/MM/dd HH:mm:ss"
                      :time="formattedTime(pageHeaderData.end_time)"/>
            </template>
          </n-statistic>
        </n-gi>
      </n-grid>
      <n-grid :cols="5">
        <n-gi>
        </n-gi>

      </n-grid>
      <!--      <n-card>-->
      <!--        kk-->
      <!--      </n-card>-->
    </n-page-header>

    <!--    <n-divider>任务记录详情</n-divider>-->

    <!--  记录表格  -->
    <n-data-table
        remote
        style="margin-top: 20px"
        :row-key="(row) => row.id"
        striped
        :columns="columns"
        :data="recordDates"
        :pagination="paginationReactive"
    />

    <!-- 图片预览对话框 -->
    <n-modal ref="AbaAba" v-model:show="isPreviewOpen" title="记录图像预览" preset="dialog"
             style="width: 90%;height: 90%">
      <!--      <n-image :src="currentImage" style="height: 100%;width:100%;"/>-->
      <div style="display: flex;justify-content: space-around;align-items: flex-start;">
        <div>
          <v-stage :config="stageConfig">
            <v-layer>
              <v-image v-if="showImage" :image="curImg" :width="stageConfig.width" :height="stageConfig.height"/>

              <!-- 绘制矩形框 -->
              <template v-for="face in boundingBoxes">
                <v-rect
                    :config="{
                    x: face.box[0] * xishu.wx,
                    y: face.box[1] * xishu.hx,
                    width: (face.box[2]-face.box[0])* xishu.wx,
                    height: (face.box[3]-face.box[1])* xishu.hx,
                    stroke: face.label==='UNK'?'rgb(255, 255, 0)' : 'rgb(0, 255, 0)',
                    shadowBlur: 10
                    }"
                    @click="handleRectClick(face)"
                />
                <v-text
                    :config="{
                    x: face.box[0] * xishu.wx + 2,
                    y: face.box[1] * xishu.hx - 17,
                    fontSize: 16,
                    text: face.label,
                    fill: face.label==='UNK'?'rgb(255, 255, 0)' : 'rgb(0, 255, 0)',
                    shadowBlur: 10
                }"/>

              </template>


              <!--            &lt;!&ndash; 绘制文本 &ndash;&gt;-->
              <!--            <v-text-->
              <!--                :config="{-->
              <!--            x: box.x, // 根据需要设置文本的位置-->
              <!--            y: box.y, // 根据需要设置文本的位置-->
              <!--            text: box.x.toString(), // 显示的文本内容-->
              <!--            fontSize: 12,-->
              <!--            fontFamily: 'Arial',-->
              <!--            fontStyle: 'italic',-->
              <!--            fontWeight: 'bold',-->
              <!--            fill: '#ffffff',-->
              <!--            anchor: [0.5, 0.5],-->
              <!--          }"-->
              <!--            />-->
            </v-layer>
          </v-stage>
        </div>
        <div style="margin-top: 5vh;">
          <n-statistic label="已识别用户" :value="currentRecognized">
            <template #prefix>
              <n-icon>
                <PeopleQueue24Regular/>
              </n-icon>
            </template>
            <template #suffix>
              /{{ currentDetected }} 位
            </template>
          </n-statistic>

          <n-card :bordered="false" class="mt-4" size="large" :segmented="{content: true}" style="width: 10vw">
            <n-descriptions v-show="showFaceById" :column="1" :bordered="false" size="small" label-align="left"
                            label-placement="left" title="基本信息">
              <n-descriptions-item label="id">{{ faceByIdInfo.id }}</n-descriptions-item>
              <n-descriptions-item label="姓名">{{ faceByIdInfo.name }}</n-descriptions-item>
              <n-descriptions-item label="性别">{{ faceByIdInfo.gender }}</n-descriptions-item>
              <n-descriptions-item label="备注">{{ faceByIdInfo.phone }}</n-descriptions-item>
              <n-descriptions-item label="来源">
                <n-tag :type="faceByIdInfo.source === 'Upload' ? 'primary' : 'warning'" size="small">
                  {{ faceByIdInfo.source === 'Upload' ? '上传' : faceByIdInfo.source === 'Snapshot' ? '抓拍' : '其他' }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="头像">
                <n-image v-if="faceByIdInfo.face_image_path" :src="`${baseUrl}/${faceByIdInfo.face_image_path}`" :width="50" :height="50"/>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

        </div>
      </div>


      <div class="preview-nav">
        <n-button @click="showPrevImage" :disabled="currentIndex === 0">上一条</n-button>
        <n-button @click="showNextImage" :disabled="currentIndex === recordDates.length - 1">下一条</n-button>
      </div>
      <template #footer>
        <n-button @click="isPreviewOpen = false">关闭</n-button>
      </template>
    </n-modal>

  </n-card>
</template>


<script setup lang="ts">
import {h, reactive, ref, unref, onMounted} from "vue"
import {NButton, NTime} from "naive-ui";
import type {DataTableBaseColumn} from 'naive-ui';
import {useRoute} from "vue-router";
import {getRecords} from "@/api/tasks/faceRecord.ts";
import {getTask} from "@/api/tasks/faceTask.ts";
import {ClipboardTask24Regular, Timer24Regular, PeopleQueue24Regular} from '@vicons/fluent';
import {getFaceById} from "@/api/faces/face";

const stageConfig = reactive({
  width: document.documentElement.clientWidth * 0.9 * 0.82,
  height: document.documentElement.clientHeight * 0.9 * 0.85,
})
const xishu = reactive({
  wx: stageConfig.width / 1920,
  hx: stageConfig.height / 1080,
})

const boundingBoxes= ref<BoundingBox[]>([])
interface BoundingBox {
  box: [number, number, number, number];
  detect_score: number;
  kps: [number, number][];
  label: string;
  label_id: string;
}

const AbaAba = ref(null);
const showImage = ref(false)
const route = useRoute()
// const token: Ref<string> = ref(route.params.token);
const alignStyle = 'center'
const recordDates = ref<RowData[]>([]);
const baseUrl = process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOB_PROD_BASE_URL : import.meta.env.VITE_PRODUCTION_URL

const isPreviewOpen = ref(false); // 预览对话框是否打开
const showFaceById = ref(false);

const currentImage = ref(''); // 当前预览图片的URL
const currentIndex = ref(0); // 当前预览的记录索引
const currentDetected = ref(0);// 当前预览的检测数
const currentRecognized = ref(0); // 当前预览的识别数

type RowData = {
  id: number,
  face_count: number,
  record_image_path: string,
  record_info: string,
  record_names: Array<string>,
  start_time: string
}

function handleBack() {
  window.history.back();
}


const createColumns = ({infoRow}: {
  infoRow: (rowData: RowData) => void
}): DataTableBaseColumn<RowData>[] => {
  return [
    {
      title: '识别时间',
      key: 'start_time',
      width: 100,
      align: alignStyle,
      render(row) {
        return h(NTime, {time: new Date(row.start_time), format: 'yyyy/MM/dd HH:mm:ss'})
      }
    },
    {
      title: '检测人脸数',
      key: 'face_count',
      width: 50,
      align: alignStyle,
    },
    {
      title: '识别身份数',
      key: 'record_names',
      width: 50,
      align: alignStyle,
      render(row) {
        return row.record_names.length;
      }
    },
    {
      title: '人脸名称',
      key: 'record_names',
      width: 200,
      align: alignStyle,
      ellipsis: {tooltip: true},
      render(row) {
        return row.record_names ? row.record_names.join('，') : '';
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
    return `共计：${itemCount} 项`
  },
  onChange: (page: number) => {
    paginationReactive.page = page
    loadRecordData()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize;
    paginationReactive.page = 1;
    loadRecordData()
  }
})

const pageHeaderData = reactive({
  name: '',
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
      return '未知'
  }
})

// const statusTagType = computed(() => {
//   switch (pageHeaderData.status) {
//     case 'Running':
//       return 'success';
//     case 'Waiting':
//       return 'warning';
//     case 'Finished':
//       return 'info';
//     default:
//       return 'error'
//   }
// })

const loadTaskData = async () => {
  try {
    const response = await getTask(route.params.token as string)
    if (response.status === 200) {
      Object.assign(pageHeaderData, response.data)
    }
  } catch (e) {
    console.log(e)
  }
}

const loadRecordData = async () => {
  try {
    const response = await getRecords(route.params.token as string, paginationReactive.page, paginationReactive.pageSize)
    if (response.status === 200) {
      recordDates.value = response.data.items
      paginationReactive.pageCount = response.data.pages
      paginationReactive.itemCount = response.data.total
    }
  } catch (error) {
    console.log(error)
  }
}


onMounted(() => {
  Promise.all([loadRecordData(), loadTaskData()])
})


const curImg = ref(new Image());
const columns = createColumns({
  infoRow(rowData) {
    const recordInfo = JSON.parse(rowData.record_info)

    currentImage.value = `${baseUrl}/${rowData.record_image_path}`;
    currentIndex.value = unref(recordDates).findIndex(record => record.id === rowData.id);
    currentDetected.value = unref(rowData).face_count;
    currentRecognized.value = unref(rowData).record_names.length;
    curImg.value.src = currentImage.value;
    showFaceById.value = false;

    boundingBoxes.value = recordInfo.faces;
    // 监听图片加载完成
    curImg.value.onload = () => {
      //  图片加载完成后，将图片赋值给img标签
      showImage.value = true;
      isPreviewOpen.value = true;
    }
  }
})

const faceByIdInfo = reactive({
  id: '',
  name: '',
  gender: '',
  phone: '',
  source: '',
  face_image_path: '',
})

const handleRectClick = async (face) => {
  if (face.label !== 'UNK') {
    // console.log(face.label_id)
    try {
      const response = await getFaceById(face.label_id)
      if (response.status === 200) {
        // console.log(response.data)
        Object.assign(faceByIdInfo, response.data)
        showFaceById.value = true;
      }
    } catch {
      console.log("error")
    }
  }
}

// 格式化时间显示
function formattedTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  if (!isNaN(dateTime.getTime())) {
    return dateTime;
  } else {
    return new Date();
  }
}


// 显示上一条记录的图片
function showPrevImage() {
  if (currentIndex.value > 0) {
    showImage.value = false;
    currentIndex.value--;
    currentImage.value = `${baseUrl}/${unref(recordDates)[currentIndex.value].record_image_path}`;
    currentRecognized.value = unref(recordDates)[currentIndex.value].record_names.length
    currentDetected.value = unref(recordDates)[currentIndex.value].face_count
    const recordInfo = JSON.parse(unref(recordDates)[currentIndex.value].record_info);
    boundingBoxes.value = recordInfo.faces
    curImg.value.src = currentImage.value;
    showFaceById.value = false;
    curImg.value.onload = () => {
      showImage.value = true;
    }
  }
}

// 显示下一条记录的图片
function showNextImage() {
  if (currentIndex.value < unref(recordDates).length - 1) {
    showImage.value = false
    currentIndex.value++;
    currentImage.value = `${baseUrl}/${unref(recordDates)[currentIndex.value].record_image_path}`;
    currentRecognized.value = unref(recordDates)[currentIndex.value].record_names.length
    currentDetected.value = unref(recordDates)[currentIndex.value].face_count
    const recordInfo = JSON.parse(unref(recordDates)[currentIndex.value].record_info);
    boundingBoxes.value = recordInfo.faces
    curImg.value.src = currentImage.value;
    showFaceById.value = false;
    curImg.value.onload = () => {
      showImage.value = true;
    }
  }
}
</script>


<style scoped lang="less">
.preview-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

</style>