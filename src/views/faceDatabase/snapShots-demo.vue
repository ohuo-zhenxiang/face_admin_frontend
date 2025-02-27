<template>
  <n-card class="flex justify-center">
    <n-input-group class="flex justify-center items-center">
      <n-button type="success">WebRTC:</n-button>
      <n-select v-model:value="selectedUrl" :options="webrtcOptions" placeholder="请选择视频的webrtc" style="width: 33%"/>
    </n-input-group>
    <Webrtc :key="webrtcKey" ref="webrtcPlayer" id="videoplayer" :src="selectedUrl" @upload-event="handleUploadEvent" class="mt-6"/>
  </n-card>

  <!--编辑得弹窗-->
  <n-modal v-model:show="showCropDialog" :show-icon="false" preset="dialog" title="编辑图像"
           style="width: 90%;height: 80%">
    <template #action>
      <n-space>
        <n-button @click="()=>(showCropDialog=false)">取消</n-button>
        <n-button type="primary" @click="()=>(showCropDialog=false)">完成</n-button>
      </n-space>
    </template>

    <div style="display: flex;justify-content: space-around;align-items: flex-start;">
      <!--改自动检测然后选取-->
      <div>
        <v-stage :config="{width:1100, height: 618}">
          <v-layer :scaleX="0.55" :scaleY="0.55">
            <v-image :image="currentImage"/>
            <template v-for="face in detectedList">
              <v-rect
                  :config="{
                  x: face.box[0],
                  y: face.box[1],
                  width: face.box[2]-face.box[0],
                  height: face.box[3]-face.box[1],
                  stroke: 'rgb(0,255,0)',
                  strokeWidth: 4,
                  shadowBlur: 10,
                  }"
                  @click="handleRectClick(face)"
              />
              <v-text
                  :config="{
                  x: face.box[0]+2,
                  y: face.box[1]-30,
                  fontSize: 28,
                  text: face.detect_score,
                  fill: 'rgb(0,255,0)',
                  shadowBlur: 10,
                  }"
              />
            </template>
          </v-layer>
        </v-stage>
      </div>

      <div style="width: 200px; height: 200px;text-align: center;">
        <n-h3>检测结果预览</n-h3>
        <n-divider/>
        <!--        <img :src="previews" alt="" style="width: 200px;height:200px;object-fit: cover;border: 2px solid seagreen;">-->
        <v-stage :config="{width: 200, height: 200}">
          <v-layer>
            <v-image
                v-if="showPreview"
                :key="JSON.stringify(cropConfig)"
                :width="200"
                :height="200"
                :image="currentImage"
                :crop="{
                  x: cropConfig.x,
                  y: cropConfig.y,
                  width: cropConfig.width,
                  height: cropConfig.height,
                }"
            />
          </v-layer>
        </v-stage>
        <p class="text-s text-red-400">请选择质量大于80分的人脸</p>
        <n-form :model="formParams" :rules="formRules" ref="formRef" label-placement="left" :label-width="60"
                class="py-4">
          <n-form-item label="姓名:" path="name">
            <n-input placeholder="请输入名称" v-model:value="formParams.name"/>
          </n-form-item>
          <n-form-item label="备注:" path="phone">
            <n-input placeholder="请输入备注" v-model:value="formParams.phone"></n-input>
          </n-form-item>
          <n-form-item label="性别" path="gender">
            <n-radio-group v-model:value="formParams.gender">
              <n-radio value="男">男</n-radio>
              <n-radio value="女">女</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-button type="primary" @click="handleClick" style="margin-top: 5vh">上传</n-button>
        </n-form>
      </div>

    </div>
  </n-modal>

</template>


<script setup lang="ts">
import Webrtc from '@/components/VideoPlayer/WebRtcPlayer.vue';
import {ref, reactive} from "vue";
import {type FormRules, useMessage} from "naive-ui";
import {createSnapshot, getDetectedInfo} from "@/api/faces/face";

const webrtcOptions = [{value: 'webrtc://192.168.199.18/live/2c9280826cfb0ed5016cfb10556c001c', label: 'Webrtc-182'},
  {value: 'webrtc://192.168.199.18/live/2c9280826cfb0ed5016cfb1055ab0026', label: 'Webrtc-183'}]
const webrtcKey = ref(0);
const selectedUrl = ref(webrtcOptions[0].value)
watch(selectedUrl, (newUrl, oldValue)=>{
  if (newUrl !== oldValue){
    // console.log(webrtcKey)
    webrtcKey.value += 1
  }
})

const message = useMessage();
const showCropDialog = ref(false);
const currentImage = ref(new Image());
const showPreview = ref(false);
const formParams = reactive({
  name: '',
  phone: '',
  gender: '',
  image: null,
});



function formParamsReload() {
  formParams.name = '';
  formParams.phone = '';
  formParams.gender = '';
  currentImage.value = new Image();
  Object.assign(currentImage, {});
}
// console.log(selectedUrl)

const formRules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
  phone: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入备注',
  }
}


interface Face {
  box: [number, number, number, number]
  detect_score: number,
  kps: number[][],
  lable: string;
  label_id: string;
}


const detectedList = ref<Face[]>([]);
const handleUploadEvent = (imageUrl: string) => {
  Object.assign(cropConfig, {})
  showPreview.value = false;
  currentImage.value.src = imageUrl;
  currentImage.value.onload = async () => {
    try {
      const response = await getDetectedInfo(imageUrl)
      if (response.status === 200) {
        message.success('已检测到人脸！')
        detectedList.value = response.data.faces
        showCropDialog.value = true;
      } else {
        message.error('未检测到人脸！')
      }
    } catch (error) {
      console.log(error)
    }
  }
}

interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  box: [number, number, number, number];
  detect_score: number;
  kps: [number, number][];
}

const cropConfig: CropConfig = reactive({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  box: [0, 0, 0, 0],
  detect_score: 0,
  kps: [],
})
const handleRectClick = (face:any) => {
  Object.assign(cropConfig, {
    x: face.box[0],
    y: face.box[1],
    width: face.box[2] - face.box[0],
    height: face.box[3] - face.box[1],
    box: face.box,
    detect_score: face.detect_score,
    kps: face.kps,
  })
  // console.log(cropConfig)
  showPreview.value = true;
}

// const blobToDataURI = (blob, callback) => {
//   const reader = new FileReader();
//   reader.readAsDataURL(blob);
//   reader.onload = function (e) {
//     callback(e.target.result);
//   }
// }


async function handleClick() {
  // 手动验证表单字段
  if (!formParams.name || !formParams.phone || !formParams.gender) {
    message.error("请填写完整信息")
    return; // 阻止提交
  } else if (cropConfig.kps === undefined) {
    message.error('请选择人脸')
    return
  } else if (cropConfig.detect_score < 80) {
    message.error("请选择人脸质量大于80分的照片")
    return
  }

  const requestData = {
    name: formParams.name,
    phone: formParams.phone,
    gender: formParams.gender,
    image64: currentImage.value.src,
    box: cropConfig.box,
    kps: cropConfig.kps,
  };

  try {
    const response = await createSnapshot(requestData);
    // console.log(response);
    if (response.status == 200) {
      message.success("人脸上传成功")
      showCropDialog.value = false;
      formParamsReload();
    }
  } catch (error: any) {
    const {status} = error.response;
    if (status == 409) {
      message.error("备注标识已存在")
    } else if (status === 400) {
      message.error("未检测到人脸, 请重新操作")
    }
  }
}

</script>

<style scoped>

</style>