<template>
  <div class="slider" ref="slider" @click="handleMouseMove" @mousedown="handleMouseDown">
    <div
      class="slider__cursor"
      :style="{
        top: `${cursorTop}px`
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { HSV } from './types'

@Component
export default class extends Vue {
  @Prop({ required: true }) private readonly hsv!: HSV

  cursorTop: number = 0
  hue: number = 0
  isMouseDown: boolean = false
  slider: HTMLElement | null = null

  @Watch('hue')
  onHueChange(hue: number) {
    this.$emit('h', { h: hue })
  }

  @Watch('hsv')
  onHsvChange(hsv: HSV): void {
    this.setCursorTop(hsv.h)
  }

  mounted(): void {
    this.slider = this.$refs.slider as HTMLElement
    this.setCursorTop(this.hsv.h)

    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  beforeDestroy(): void {
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  setCursorTop(hue: number): void {
    this.cursorTop = (this.slider!.getBoundingClientRect().height / 360) * hue
  }
  handleMouseDown(): void {
    this.isMouseDown = true
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown && e.type !== 'click') {
      return
    }

    const rect = this.slider!.getBoundingClientRect()
    let top = e.clientY - rect.top

    top = Math.max(0, top)
    top = Math.min(top, rect.height)

    this.cursorTop = top
    this.hue = Math.round((top / rect.height) * 360)
  }

  handleMouseUp(): void {
    this.isMouseDown = false
  }
}
</script>

<style scoped lang="scss">
.slider {
  position: relative;
  background: linear-gradient(180deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red);
  border-radius: $border-radius-sm;

  &__cursor {
    position: absolute;
    width: 100%;
    height: 3px;

    background: white;

    transform: translate(0px, -50%);
  }
}
</style>
