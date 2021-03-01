<template>
  <li class="stem">
    <div class="stem__details">
      <span>{{ stem.name }}</span>
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
    </div>

    <div class="stem__waveform" @wheel="handleScrollWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove">
      <canvas ref="canvas" @dblclick="handleCanvasClick" />
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'

import stemSample from './stem-sample.vue'

import cssVariablesMixin from '@/mixins/css-variables.mixin'

import Stem from '@/types/stem'
import Sample from '@/types/sample'

@Component({
  components: {
    stemSample
  }
})
export default class extends Mixins(cssVariablesMixin) {
  @Prop() private readonly stem!: Stem

  canvas!: HTMLCanvasElement
  canvasCtx!: CanvasRenderingContext2D
  colors: string[] = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#9DBAD5', '#DBC4DF']
  opacified: string[] = this.colors.map((color) => this.opacify(color, 0.3))

  // canvas settings
  defaultDetail: number = 4000
  barWidth: number = 1
  maxBarHeight: number = 30
  heightMultiplier: number = this.maxBarHeight / this.arrayMax(this.stem.left)
  sizeReducer: number = 1.5

  stemOffsetX: number = 0
  stemOffsetDx: number = 0

  startX: number = 0
  isMouseDown: boolean = false

  zoomX: number = 1
  zoomDx: number = 1

  get detail(): number {
    return this.defaultDetail * this.zoomDx
  }

  get step(): number {
    return Math.ceil(this.stem.left.length / this.detail)
  }

  mounted(): void {
    this.canvas = this.$refs.canvas as HTMLCanvasElement
    this.canvasCtx = this.canvas.getContext('2d')!

    this.setCanvasDimensions()

    requestAnimationFrame(this.draw)

    document.addEventListener('mouseup', this.handleMouseUp)
  }

  beforeDestroy(): void {
    // this.$store.commit('setStems', [])
    // this.$store.commit('setStemResults', [])
  }

  setCanvasDimensions(): void {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.height
  }

  handleScrollWheel(e: MouseWheelEvent): void {
    this.stemOffsetX += e.deltaY
  }

  handleMouseDown(e: MouseEvent): void {
    this.isMouseDown = true
    this.startX = this.stemOffsetX + e.clientX
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown) {
      return
    }

    this.stemOffsetX = -(e.clientX - this.startX)
  }

  handleMouseUp(): void {
    this.isMouseDown = false
  }

  zoomIn(): void {
    this.zoomX++
  }

  zoomOut(): void {
    this.zoomX--
  }

  handleCanvasClick({ offsetX, offsetY }: MouseEvent): void {
    const clickPos = ((offsetX + this.stemOffsetDx) / this.zoomDx) * this.step * this.sizeReducer

    for (let i = 0; i < this.stem.samples.length; i++) {
      const start = this.stem.samples[i].offset
      const end = this.stem.samples[i].offset + this.stem.samples[i].left.length

      if (clickPos >= start && clickPos <= end) {
        console.log('clicked sample', i)
        this.$root.$emit('play', this.toAudioBuffer(this.stem.samples[i]))
        break
      }
    }
  }

  draw(): void {
    this.stemOffsetDx = this.lerp(this.stemOffsetDx, this.stemOffsetX, 0.2)
    this.stemOffsetDx = Math.floor(this.stemOffsetDx * 100) / 100

    this.zoomDx = this.lerp(this.zoomDx, this.zoomX, 0.2)
    this.zoomDx = Math.floor(this.zoomDx * 100) / 100

    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const end = ((this.canvas.width + this.stemOffsetDx) / this.zoomDx) * this.step * this.sizeReducer

    for (let i = 0, j = 0; i < end; i += this.step, j++) {
      this.canvasCtx.beginPath()

      this.canvasCtx.rect(
        (j / this.sizeReducer) * this.zoomDx - this.stemOffsetDx,
        this.canvas.height / 2,
        this.barWidth,
        this.stem.left[i] * this.heightMultiplier
      )

      this.canvasCtx.fillStyle = this.variables.primaryAccent
      this.canvasCtx.fill()
    }

    for (let i = 0; i < this.stem.samples.length; i++) {
      const sample = this.stem.samples[i]

      this.roundRect(
        (sample.offset / this.step / this.sizeReducer) * this.zoomDx - this.stemOffsetDx,
        10,
        (sample.left.length / this.step / this.sizeReducer) * this.zoomDx,
        130,
        5,
        this.opacified[sample.groupId] || this.opacify('#737373', 0.3),
        this.colors[sample.groupId] || '#737373'
      )
    }

    requestAnimationFrame(this.draw)
  }

  roundRect(x: number, y: number, width: number, height: number, radius: number, fill: string, stroke: string) {
    this.canvasCtx.beginPath()
    this.canvasCtx.moveTo(x + radius, y)
    this.canvasCtx.lineTo(x + width - radius, y)
    this.canvasCtx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.canvasCtx.lineTo(x + width, y + height - radius)
    this.canvasCtx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.canvasCtx.lineTo(x + radius, y + height)
    this.canvasCtx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.canvasCtx.lineTo(x, y + radius)
    this.canvasCtx.quadraticCurveTo(x, y, x + radius, y)
    this.canvasCtx.closePath()

    this.canvasCtx.strokeStyle = stroke
    this.canvasCtx.fillStyle = fill

    this.canvasCtx.stroke()
    this.canvasCtx.fill()
  }

  opacify(hex: string, alpha: number): string {
    return `${hex}${Math.floor(alpha * 255)
      .toString(16)
      // @ts-ignore
      .padStart(2, 0)}`
  }

  arrayMax(arr: Float32Array): number {
    let len = arr.length,
      max = -Infinity
    while (len--) {
      if (arr[len] > max) {
        max = arr[len]
      }
    }
    return max
  }

  lerp(a: number, b: number, n: number): number {
    return (1 - n) * a + n * b
  }

  toAudioBuffer(sample: Sample): AudioBuffer {
    const largest = sample.left.length > sample.right.length ? sample.left : sample.right

    const audioCtx = new AudioContext()
    const audioBuffer = audioCtx.createBuffer(2, largest.length, audioCtx.sampleRate)

    const channelBuffer1: Float32Array = audioBuffer.getChannelData(0)
    const channelBuffer2: Float32Array = audioBuffer.getChannelData(1)

    for (let i = sample.offset, j = 0; i < sample.offset + sample.left.length; i++, j++) {
      channelBuffer1[j] = this.stem.left[i]
    }

    for (let i = sample.offset, j = 0; i < sample.offset + sample.right.length; i++, j++) {
      channelBuffer2[j] = this.stem.right[i]
    }

    return audioBuffer
  }
}
</script>

<style scoped lang="scss">
.stem {
  display: flex;
  align-items: center;
  justify-content: space-between;

  border: 1px solid $border-color;
  border-radius: $border-radius;

  background: rgb(250, 250, 250);
  padding: 0.5rem;

  &__details {
    width: 200px;

    span {
      @include truncate;

      margin-right: 1rem;
      font-weight: 500;
    }
  }

  &__waveform {
    position: relative;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius;
    width: 100%;
    height: 100px;

    canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
