<template>
  <div
    class="stem-sample"
    :style="{
      ...position,
      '--color': color
    }"
    @dblclick="playSample"
    ref="sample"
    v-hover="(h) => (isHovered = h)"
  >
    <!-- details -->
    <button-element
      class="stem-sample__details"
      icon="settings"
      :round="true"
      icon-size="1.5em"
      @click.stop="showSampleDetails"
    />

    <!-- grab start -->
    <div class="stem-sample__grab-start" @mousedown="(e) => handleMouseDown(e, 'start')"></div>

    <!-- grab end -->
    <div class="stem-sample__grab-end" @mousedown="(e) => handleMouseDown(e, 'end')"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import Sample from '@/types/sample'
import Stem from '@/types/stem'

@Component
export default class extends Vue {
  @Prop() private readonly sample!: Sample
  @Prop() private readonly step!: number
  @Prop() private readonly stem!: Stem
  @Prop() private readonly detail!: number

  colors: string[] = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#9DBAD5', '#DBC4DF']

  initialWidth: number = 0
  side: string | null = null
  isMouseDown: boolean = false
  mouseStart: number = 0

  offsetStart: number = 0
  offsetEnd: number = 0

  offsetStartAtMousedown: number = 0
  offsetEndAtMouseDown: number = 0

  isHovered: boolean = false

  get color(): string {
    return this.colors[this.sample.groupId] || '#737373'
  }

  get position(): any {
    return {
      left: `calc(${(this.sample.offset * 100) / this.step / this.detail}% + ${this.offsetStart}px)`,
      width: `calc(${
        this.sample.left > this.sample.right
          ? (this.sample.left.length * 100) / this.step / this.detail
          : (this.sample.left.length * 100) / this.step / this.detail
      }% + ${this.offsetEnd}px)`
    }
  }

  get duration(): number {
    const audioCtx = new AudioContext()
    const audioBuffer = audioCtx.createBuffer(
      2,
      this.sample.left.length > this.sample.right.length ? this.sample.left.length : this.sample.right.length,
      audioCtx.sampleRate
    )

    return audioBuffer.duration
  }

  mounted(): void {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)

    this.initialWidth = (this.$refs.sample as HTMLElement).clientWidth
  }

  beforeDestroy(): void {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  showSampleDetails(): void {
    this.$store.commit('setSample', this.sample)
    this.$store.commit('setShowSampleDetails', true)
  }

  playSample(): void {
    this.$root.$emit('play', this.toAudioBuffer())
  }

  handleMouseDown(e: MouseEvent, side: string): void {
    this.side = side
    this.mouseStart = e.clientX
    this.isMouseDown = true

    this.offsetStartAtMousedown = this.offsetStart
    this.offsetEndAtMouseDown = this.offsetEnd
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown) {
      return
    }

    const moved = e.clientX - this.mouseStart

    if (this.side === 'start') {
      this.offsetStart = this.offsetStartAtMousedown + e.clientX - this.mouseStart
      this.offsetEnd = this.offsetEndAtMouseDown - moved
    } else {
      this.offsetEnd = this.offsetEndAtMouseDown + e.clientX - this.mouseStart
    }
  }

  handleMouseUp(): void {
    this.isMouseDown = false
  }

  toAudioBuffer(): AudioBuffer {
    const stemWidth = (this.$refs.sample as HTMLElement).parentElement!.clientWidth

    const percentStart = (this.offsetStart / stemWidth) * 100
    const lengthStart = Math.floor((this.stem.left.length * percentStart) / 100)

    const percentEnd = (this.offsetEnd / stemWidth) * 100
    const lengthEnd = Math.floor((this.stem.left.length * percentEnd) / 100)

    const largest = this.sample.left.length > this.sample.right.length ? this.sample.left : this.sample.right

    const audioCtx = new AudioContext()
    const audioBuffer = audioCtx.createBuffer(2, largest.length + lengthEnd + lengthStart, audioCtx.sampleRate)

    const channelBuffer1: Float32Array = audioBuffer.getChannelData(0)
    const channelBuffer2: Float32Array = audioBuffer.getChannelData(1)

    for (
      let i = this.sample.offset + lengthStart, j = 0;
      i < this.sample.offset + this.sample.left.length + lengthEnd;
      i++, j++
    ) {
      channelBuffer1[j] = this.stem.left[i]
    }

    for (
      let i = this.sample.offset + lengthStart, j = 0;
      i < this.sample.offset + this.sample.right.length + lengthEnd;
      i++, j++
    ) {
      channelBuffer2[j] = this.stem.right[i]
    }

    return audioBuffer
  }
}
</script>

<style scoped lang="scss">
.stem-sample {
  position: absolute;
  top: 0.4rem;
  height: calc(100% - 0.8rem);

  border: 1px solid var(--color);
  border-radius: $border-radius-sm;

  &__details {
    position: absolute !important;
    top: 0;
    right: 0;

    font-size: 50%;

    transform: translate(50%, -50%);
    opacity: 0;
    z-index: 2;

    padding: 0.2rem !important;

    transition: 0.2s;
  }

  &:hover &__details {
    opacity: 1;
  }

  &__grab-start,
  &__grab-end {
    position: absolute;
    top: 0;

    width: 5px;
    height: 100%;

    cursor: col-resize;
  }

  &__grab-start {
    left: 0;
  }

  &__grab-end {
    right: 0;
  }

  &::before {
    content: '';

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: var(--color);
    opacity: 0.3;
  }
}

.sample-tooltip {
  padding: 0.3rem;
  font-size: $font-xs;
}
</style>
