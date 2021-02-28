<template>
  <div>
    <stems :finished-count="finishedCount" />
    <audio-player />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

import stems from '@/components/stems/stems.vue'

import Sample from '@/types/sample'
import Stem from '@/types/stem'
import audioPlayer from '@/components/audio/audio-player.vue'

@Component({
  components: {
    stems,
    audioPlayer
  },
  computed: mapGetters(['stems'])
})
export default class extends Vue {
  stems!: File[]
  finishedCount: number = -1

  async mounted(): Promise<void> {
    if (!this.stems.length) {
      this.$router.push('/')
    }

    for (const stem of this.stems) {
      const arrayBuffer = await this.getAudioFileData(stem)
      const stemWithoutName = await this.decodeAudio(arrayBuffer, stem)

      this.$store.commit('addStemResult', {
        name: stem.name,
        ...stemWithoutName
      })

      this.finishedCount++
    }
  }

  async getAudioFileData(stem: File): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      const fr: FileReader = new FileReader()

      fr.onload = async () => {
        if (fr.result) {
          resolve(fr.result as ArrayBuffer)
        }
      }

      fr.readAsArrayBuffer(stem)
    })
  }

  decodeAudio(buffer: ArrayBuffer, stem: File): Promise<Partial<Stem>> {
    return new Promise((resolve) => {
      const audioCtx: AudioContext = new AudioContext()

      audioCtx.decodeAudioData(buffer, async (audioBuffer: AudioBuffer) => {
        const leftChannel = audioBuffer.getChannelData(0)
        const rightChannel = audioBuffer.getChannelData(1)
        const largestChannel = leftChannel.length > rightChannel.length ? leftChannel : rightChannel

        const samples: Sample[] = []
        const uniqueSamples: Sample[] = []

        let sampleGroupId = 0

        const volumeThreshold = 0.005

        for (let i = 0; i < largestChannel.length; i++) {
          const leftValue = leftChannel[i]
          const rightValue = rightChannel[i]

          if (Math.abs(leftValue) > volumeThreshold || Math.abs(rightValue) > volumeThreshold) {
            const sampleLeftAudio = this.findEnding(leftChannel, i)
            const sampleRightAudio = this.findEnding(rightChannel, i)

            const average = parseFloat(
              sampleLeftAudio
                .slice(0, 4000)
                .reduce((a, v, i) => (a * i + v) / (i + 1))
                .toFixed(10)
            )

            let exists = false

            let groupId = -1

            for (let i = 0; i < uniqueSamples.length; i++) {
              const diffSize = uniqueSamples[i].average / 50

              if (Math.abs(uniqueSamples[i].average - Math.abs(average)) <= diffSize) {
                groupId = uniqueSamples[i].groupId
                exists = true
                break
              }
            }

            if (groupId === -1) {
              groupId = ++sampleGroupId
            }

            if (!exists) {
              uniqueSamples.push({
                stem: stem.name,
                average: Math.abs(average),
                left: sampleLeftAudio,
                right: sampleRightAudio,
                offset: i,
                groupId: groupId
              })
            }

            samples.push({
              stem: stem.name,
              average: Math.abs(average),
              left: sampleLeftAudio,
              right: sampleRightAudio,
              unique: !exists,
              offset: i,
              groupId: groupId
            })

            i += sampleLeftAudio.length
          }
        }
        // console.log(`Found ${samples.length} samples`)
        console.log('samples', samples)

        resolve({
          samples,
          duration: audioBuffer.duration,
          stereo: audioBuffer.numberOfChannels === 2,
          left: leftChannel,
          right: rightChannel
        })
      })
    })
  }

  findEnding(array: Float32Array, start: number, current: number = start): Float32Array {
    current = current || start

    const accuracy: number = 300 // lower is smaller chunks

    const subArr: Float32Array = array.slice(current, current + accuracy)
    const average: number = subArr.reduce((a, b) => Math.abs(a) + Math.abs(b) / subArr.length)

    if (average > 0.0001) {
      return this.findEnding(array, start, current + accuracy)
    } else {
      return array.slice(start, current + accuracy)
    }
  }
}
</script>

<style scoped lang="scss">
.stems {
  li {
    display: flex;
    align-items: center;

    span {
      margin-left: 0.5rem;
    }
  }
}
</style>
