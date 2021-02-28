<template>
  <li class="stem">
    <div class="stem__details">
      <span>{{ stem.name }}</span>
    </div>

    <div class="stem__waveform">
      <canvas ref="canvas" />
      <stem-sample
        v-for="(sample, i) of stem.samples"
        :key="i"
        :sample="sample"
        :step="step"
        :detail="detail"
        :stem="stem"
      />
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'

import stemSample from './stem-sample.vue'

import cssVariablesMixin from '@/mixins/css-variables.mixin'

import Stem from '@/types/stem'

@Component({
  components: {
    stemSample
  }
})
export default class extends Mixins(cssVariablesMixin) {
  @Prop() private readonly stem!: Stem

  canvas!: HTMLCanvasElement

  detail: number = 10000
  step: number = 0
  barWidth: number = 1

  mounted(): void {
    this.canvas = this.$refs.canvas as HTMLCanvasElement

    this.setCanvasDimensions()

    this.draw()
  }

  beforeDestroy(): void {
    this.$store.commit('setStems', [])
    this.$store.commit('setStemResults', [])
  }

  setCanvasDimensions(): void {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.height
  }

  draw(): void {
    this.step = Math.ceil(this.stem.left.length / this.detail)

    const canvasCtx = this.canvas.getContext('2d')!
    const maxBarHeight = 50
    const heightMultiplier = maxBarHeight / this.arrayMax(this.stem.left)

    canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (let i = 0, j = 0; i < this.stem.left.length; i += this.step) {
      canvasCtx.beginPath()

      if (this.stem.left[i] !== 0) {
        canvasCtx.rect(
          j * (this.canvas.width / this.detail),
          this.canvas.height / 2,
          this.barWidth,
          this.stem.left[i] * heightMultiplier
        )
        canvasCtx.rect(
          j * (this.canvas.width / this.detail),
          this.canvas.height / 2,
          this.barWidth,
          this.stem.left[i] * heightMultiplier * -1
        )

        canvasCtx.fillStyle = this.variables.primaryAccent
        canvasCtx.fill()
      }

      j++
    }
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
