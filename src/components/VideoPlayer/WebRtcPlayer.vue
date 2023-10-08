<template>
  <div>
    <video
        :id="rtcId" ref="jswebrtc"
        style="width: 86%;height: 86%;object-fit: fill; display: flex;justify-content: space-around;margin:0 auto"
    />
    <div style="margin-top: 10px;margin-left: 35vw">
      <n-button-group style="display: flex; gap: 10px;margin:0 auto">
        <n-button @click="playVideo" type="info" :disabled="is_play">
          <template #icon>
            <n-icon>
              <Play24Regular/>
            </n-icon>
          </template>
          播放
        </n-button>
        <n-button @click="stopVideo" type="info" :disabled="!is_play">
          <template #icon>
            <n-icon>
              <PauseOutlined/>
            </n-icon>
          </template>
          暂停
        </n-button>
        <n-button @click="uploadScreenshot" type="primary">
          <template #icon>
            <n-icon>
              <Crop24Regular/>
            </n-icon>
          </template>
          检测
        </n-button>
      </n-button-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {v1 as uuid} from 'uuid'
import {ref, computed, onMounted, onBeforeUnmount} from 'vue'
import {PauseOutlined} from "@vicons/antd";
import {Play24Regular, Crop24Regular} from "@vicons/fluent";

const is_play = ref(false);
const rtcId = computed(() => props.id ?? uuid());
let player: any = null;
const emit = defineEmits();

interface Props {
  src: string
  prefix?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  prefix: '',
})


onMounted(() => {
  try {
    initVideo(`${props.prefix}${props.src}`)
  } catch (error) {
    console.error(error)
  }
})

onBeforeUnmount(() => {
  if (player) {
    player.destroy()
    player = null
  }
})

function initVideo(url: string) {
  // debugger
  if (player) {
    player.destroy()
    player = null
  }
  // 获取承载元素dom
  const videoDom: any = document.getElementById(rtcId.value)
  if (videoDom)
    videoDom.controls = true

  // 初始化播放器

  player = new (JSWebrtc.Player as any)(url,
      {
        video: videoDom,
        autoplay: false,
        onPlay: () => {
          // 监听video元素状态，可播放时进行播放 。 某些情况下  autoplay 会失效
          // mdn https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/canplay_event
          // 菜鸟 https://www.runoob.com/tags/av-event-canplay.html
          videoDom.addEventListener('canplay', () => {
            videoDom.play()
          })
        },
      })
}

const playVideo = () => {
  console.log("playvideo")
  console.log(props.src)
  player.play()
  is_play.value = !is_play.value
}

const stopVideo = () => {
  player.stop()
  is_play.value = !is_play.value
}

const uploadScreenshot = () => {
  const videoDom: HTMLVideoElement | null = document.getElementById(rtcId.value) as HTMLVideoElement | null;
  if (videoDom && videoDom instanceof HTMLVideoElement) {
    const cancanneed = document.createElement('canvas');
    cancanneed.width = videoDom.videoWidth;
    cancanneed.height = videoDom.videoHeight;

    const ctx = cancanneed.getContext('2d')!;
    ctx.drawImage(videoDom as HTMLVideoElement, 0, 0, cancanneed.width, cancanneed.height);
    const url = cancanneed.toDataURL('image/png');
    emit('upload-event', url);
  } else {
    console.log('videoDom is null')
  }
}

</script>

