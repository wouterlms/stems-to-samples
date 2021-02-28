<template>
  <div
    class="panel"
    ref="panel"
    :style="{
      background: `hsl(${hsv.h}, 100%, 50%)`
    }"
    @click="handleMouseMove"
    @mousedown="handleMouseDown"
  >
    <div
      class="panel__cursor"
      :style="{
        top: `${cursorTop}px`,
        left: `${cursorLeft}px`
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
  cursorLeft: number = 0
  saturation: number = 0
  value: number = 0
  isMouseDown: boolean = false
  panel: HTMLElement | null = null

  @Watch('value')
  onValueChange(value: number): void {
    this.$emit('sv', { s: this.saturation, v: value })
  }

  @Watch('hsv')
  onHsvChange(hsv: HSV): void {
    this.setCursorPosition(hsv.s, hsv.v)
  }

  mounted(): void {
    this.panel = this.$refs.panel as HTMLElement
    this.setCursorPosition(this.hsv.s, this.hsv.v)

    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  beforeDestroy(): void {
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  setCursorPosition(saturation: number, value: number): void {
    const rect = this.panel!.getBoundingClientRect()

    this.cursorLeft = (saturation * rect.width) / 100
    this.cursorTop = ((100 - value) * rect.height) / 100
  }

  handleMouseDown(): void {
    this.isMouseDown = true
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown && e.type !== 'click') {
      return
    }

    const rect = this.panel!.getBoundingClientRect()

    let left = e.clientX - rect.left
    let top = e.clientY - rect.top

    left = Math.max(0, left)
    left = Math.min(left, rect.width)

    top = Math.max(0, top)
    top = Math.min(top, rect.height)

    this.cursorTop = top
    this.cursorLeft = left

    this.positionToHsv(top, left, rect)
  }

  handleMouseUp(): void {
    this.isMouseDown = false
  }

  positionToHsv(top: number, left: number, rect: DOMRect): void {
    this.saturation = (left / rect.width) * 100
    this.value = 100 - (top / rect.height) * 100
  }
}
</script>

<style scoped lang="scss">
.panel {
  position: relative;
  border-radius: $border-radius-sm;

  &::before,
  &::after {
    content: '';

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    border-radius: $border-radius-sm;
  }

  &::before {
    background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
  }

  &::after {
    background: linear-gradient(0deg, #000, transparent);
  }

  &__cursor {
    position: absolute;

    width: 5px;
    height: 5px;

    border: 1px solid white;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: $box-shadow;
    border-radius: 50%;

    transform: translate(-50%, -50%);
    z-index: 1;

    &::before {
      content: '';
    }
  }
}
</style>
