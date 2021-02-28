<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {
  audioCtx: AudioContext = new AudioContext()
  source!: AudioBufferSourceNode

  mounted(): void {
    this.$root.$on('play', this.playSample)
  }

  beforeDestroy(): void {
    this.$root.$off('play', this.playSample)
  }

  playSample(audioBuffer: AudioBuffer): void {
    if (this.source) {
      this.source.stop()
    }

    this.source = this.audioCtx.createBufferSource()
    this.source.buffer = audioBuffer
    this.source.connect(this.audioCtx.destination)
    this.source.start()
  }
}
</script>

<style scoped></style>
