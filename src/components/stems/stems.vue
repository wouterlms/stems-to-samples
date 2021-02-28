<template>
  <ul class="stems">
    <button-element @click="createZip">export selected samples</button-element>
    <template v-for="(stem, i) of stems">
      <li :key="i" v-if="finishedCount < i">
        <span>Analysing {{ stem.name }}...</span>
      </li>
      <stem :key="i" v-else :stem="stemResults[i]" />
    </template>

    <stem-sample-details />
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

import JsZip from 'jszip'

import stem from './stem.vue'
import stemSampleDetails from './stem-sample-details.vue'
import Sample from '@/types/sample'

const audioBufferToWav = require('audiobuffer-to-wav')

@Component({
  components: {
    stem,
    stemSampleDetails
  },
  computed: mapGetters(['stems', 'stemResults', 'exportSamples'])
})
export default class extends Vue {
  @Prop() private readonly finishedCount!: number

  exportSamples!: Sample[]

  createZip(): void {
    const zip = new JsZip()

    this.exportSamples.forEach((sample: Sample, i) => {
      const blob = this.createBlob(sample)
      zip.file(`test${i}.wav`, blob)

      if (i === this.exportSamples.length - 1) {
        zip
          .generateAsync({
            type: 'blob'
          })
          .then((content: Blob) => {
            this.download(content)
          })
      }
    })
  }

  createBlob(sample: Sample): Blob {
    const blob = new Blob([audioBufferToWav(this.toAudioBuffer(sample))], {
      type: 'audio/wav'
    })
    return blob
  }

  toAudioBuffer(sample: Sample): AudioBuffer {
    const largest = sample.left.length > sample.right.length ? sample.left : sample.right

    const audioCtx = new AudioContext()
    const audioBuffer = audioCtx.createBuffer(2, largest.length, audioCtx.sampleRate)

    const channelBuffer1: Float32Array = audioBuffer.getChannelData(0)
    const channelBuffer2: Float32Array = audioBuffer.getChannelData(1)

    for (let i = 0; i < sample.left.length; i++) {
      channelBuffer1[i] = sample.left[i]
    }

    for (let i = 0; i < sample.right.length; i++) {
      channelBuffer2[i] = sample.right[i]
    }

    return audioBuffer
  }

  download(blob: Blob): void {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `samples-${Date.now()}.zip`
    a.click()
    a.remove()
  }
}
</script>

<style scoped lang="scss">
.stems {
  padding: 4rem;

  li {
    &:not(:last-of-type) {
      margin-bottom: 1rem;
    }
  }
}
</style>
