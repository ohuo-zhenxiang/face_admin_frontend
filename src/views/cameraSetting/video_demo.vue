<template>
  <n-card>
    <Webrtc id="videoplayer" src="webrtc://192.168.199.157/live/livestream"
            @upload-event="handleUploadEvent"/>
  </n-card>

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
  name:'',
  phone: '',
  image: null,
});
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
    if (response.status == 200){
      message.success("人脸上传成功")
      showCropDialog.value = false;
    } else {
      // useMessage().error("人脸上传失败")
    }
  } catch (err) {
    console.error(err);
    message.error("人脸上传失败, 请重新操作")
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