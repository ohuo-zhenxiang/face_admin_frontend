<template>
  <n-card>
    <Webrtc id="videoplayer" src="webrtc://192.168.199.18/live/ff8080816cf67386016cf67e4e2d0000"
            @upload-event="handleUploadEvent"/>
  </n-card>

  <!--编辑得弹窗-->
  <n-modal v-model:show="showCropDialog" :show-icon="false" preset="dialog" title="编辑图像"
           style="width: 93%;height: 80%">
    <template #action>
      <n-space>
        <n-button @click="()=>(showCropDialog=false)">取消</n-button>
        <n-button type="primary" @click="()=>(showCropDialog=false)">完成</n-button>
      </n-space>
    </template>

    <div style="display: flex;justify-content: space-around;align-items: flex-start;">
      <!--裁剪的不用了，就np-->
      <div style="height:618px;width:1100px;">
        <VueCropper ref="cropper"
                    :img="croppedImageUrl"
                    :outputSize="1"
                    :outputType="options.outputType"
                    :info="true"
                    :full="true"
                    :fixed="options.fixed"
                    :fixedNumber="options.fixedNumber"
                    :fixed-box="false"
                    :can-move="false"
                    :can-move-box="options.canMoveBox"
                    :original="true"
                    :auto-crop="true"
                    :auto-crop-height="100"
                    :auto-crop-width="100"
                    :center-box="true"
                    :info-true="true"
                    :enlarge="1"
                    mode="cover"
                    @real-time="realTime"
        />
      </div>

      <div style="width: 200px; height: 200px;text-align: center;">
        <n-h3>预览</n-h3>
        <n-divider/>
        <img :src="previews" alt="" style="width: 200px;height:200px;object-fit: cover;border: 2px solid seagreen;">
        <n-form :model="formParams" :rules="formRules" ref="formRef" label-placement="left" :label-width="60"
                class="py-4">
          <n-form-item label="姓名:" path="name">
            <n-input placeholder="请输入名称" v-model:value="formParams.name"/>
          </n-form-item>
          <n-form-item label="备注:" path="phone">
            <n-input placeholder="请输入备注" v-model:value="formParams.phone"></n-input>
          </n-form-item>
          <n-button type="primary" @click="handleClick" style="margin-top: 5vh">上传</n-button>
        </n-form>
      </div>

    </div>
  </n-modal>

</template>


<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import Webrtc from '@/components/VideoPlayer/WebRtcPlayer.vue';
import {VueCropper} from "vue-cropper";
import {ref, reactive} from "vue";
import {type FormRules, useMessage} from "naive-ui";
import {createSnapshot} from "@/api/faces/face";

const message = useMessage();
const cropper = ref(null);
const showCropDialog = ref(false);
const croppedImageUrl = ref('');
const previews = ref(null);
const previewFileStyle = ref({});
const tempScale = ref<number>(0);
const formParams = reactive({
  name: '',
  phone: '',
  image: null,
});

function formParamsReload() {
  formParams.name = '';
  formParams.phone = '';
}

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

const options = ({
  img: '',             //裁剪图片的地址
  outputSize: 1,       //裁剪生成图片的质量(可选0.1 - 1)
  outputType: 'jpeg',  //裁剪生成图片的格式（jpeg || png || webp）
  info: true,          //图片大小信息
  canScale: true,      //图片是否允许滚轮缩放
  autoCrop: true,      //是否默认生成截图框
  autoCropWidth: 100,  //默认生成截图框宽度
  autoCropHeight: 100, //默认生成截图框高度
  fixed: 'fixed',         //是否开启截图框宽高固定比例
  fixedNumber: [1, 1], //截图框的宽高比例
  full: false,         //false按原比例裁切图片，不失真
  fixedBox: false,      //固定截图框大小，不允许改变
  canMove: true,      //上传图片是否可以移动
  canMoveBox: true,    //截图框能否拖动
  original: false,     //上传图片按照原始比例渲染
  centerBox: false,    //截图框是否被限制在图片里面
  height: true,        //是否按照设备的dpr 输出等比例图片
  infoTrue: false,     //true为展示真实输出图片宽高，false展示看到的截图框宽高
  maxImgSize: 3000,    //限制图片最大宽度和高度
  enlarge: 1,          //图片根据截图框输出比例倍数
  mode: '80% 80%'  //图片默认渲染方式
})

const handleUploadEvent = (imageUrl) => {
  showCropDialog.value = true;
  croppedImageUrl.value = imageUrl;
}

const blobToDataURI = (blob, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = function (e) {
    callback(e.target.result);
  }
}

const realTime = (data: any) => {
  tempScale.value = 228 / data.w
  previewFileStyle.value = {
    width: data.w + 'px',
    height: data.h + 'px',
    'margin-left': '100px',
    overflow: 'hidden',
    zoom: tempScale.value,
    position: 'relative',
    border: '1px solid #ccc',
    'border-radius': '2px'
  }

  cropper.value.getCropBlob(data => {
    blobToDataURI(data, res => {
      previews.value = res;
    })
  })
}

async function handleClick() {
  // 手动验证表单字段
  if (!formParams.name || !formParams.phone) {
    message.error("请填写完整信息")
    return; // 阻止提交
  }

  const data = await new Promise(resolve => {
    cropper.value.getCropData(data => {
      resolve(data);
    });
  });

  const requestData = {
    name: formParams.name,
    phone: formParams.phone,
    image: data,
  };

  try {
    const response = await createSnapshot(requestData);
    console.log(response);
    if (response.status == 200) {
      message.success("人脸上传成功")
      showCropDialog.value = false;
      formParamsReload();
    }

  } catch (err) {
    const {status} = err.response;
    if (status == 409) {
      message.error("手机号已存在")
    } else if (status === 400) {
      message.error("未检测到人脸, 请重新操作")
    }
  }
}

const handleCrop = () => {
  showCropDialog.value = false; // 关闭裁剪弹窗
}

const handleCancel = () => {
  showCropDialog.value = false; // 关闭裁剪弹窗
}

const handleCropComplete = (croppedImage) => {
  console.log('Cropped image:', croppedImage);
  showCropDialog.value = false; // 关闭裁剪弹窗
}


</script>

<style scoped>

</style>