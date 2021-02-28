<template>
  <div
    class="ripple"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @mousedown.passive="handleMouseDown"
  >
    <slot />
    <ripple-wave v-for="wave of waves" :key="wave.id" :style="wave.style" @wave-end="handleWaveEnd(wave)" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import rippleWave from './ripple-wave.vue'

@Component({
  components: {
    rippleWave
  }
})
export default class Ripple extends Vue {
  /** Disabled */
  @Prop() private readonly disabled!: boolean

  touchTimeout: ReturnType<typeof setTimeout> | null = null
  waves: any[] = []
  id: number = 0
  disableMouse: boolean = false

  chcke(): boolean {
    return false
  }

  handleTouchStart(e: TouchEvent): void {
    this.disableMouse = true

    this.touchTimeout = setTimeout(() => {
      this.createRipple(e)
    }, 100)
  }

  handleTouchMove(e: TouchEvent): void {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout)
    }
  }

  handleMouseDown(e: MouseEvent): void {
    this.createRipple(e)
  }

  handleWaveEnd(wave: any): void {
    this.waves.splice(
      this.waves.find((w) => w.id === wave.id),
      1
    )
  }

  createRipple(e: TouchEvent | MouseEvent): void {
    if (this.disabled) {
      return
    }

    requestAnimationFrame(() => {
      const size = this.getSize()
      const position = this.getHitPosition(e, size)

      this.waves.push({
        id: ++this.id,
        style: {
          ...position,
          width: size + 'px',
          height: size + 'px'
        }
      })
    })
  }

  getSize(): number {
    const { offsetWidth, offsetHeight } = this.$el as HTMLElement
    return Math.round(Math.max(offsetWidth, offsetHeight))
  }

  getHitPosition(e: TouchEvent | MouseEvent, size: number): any {
    const rect = this.$el.getBoundingClientRect()
    let top, left

    if (e.type === 'touchstart') {
      top = (e as TouchEvent).targetTouches[0].clientY - rect.y
      left = (e as TouchEvent).targetTouches[0].clientX - rect.x
    } else {
      top = (e as MouseEvent).clientY - rect.y
      left = (e as MouseEvent).clientX - rect.x
    }

    return {
      top: top - size / 2 + 'px',
      left: left - size / 2 + 'px'
    }
  }
}
</script>

<style scoped lang="scss">
.ripple {
  position: relative;
  display: inline-block;

  height: 100%;

  overflow: hidden;

  -webkit-mask-image: radial-gradient(circle, #fff 100%, #000 100%);
}
</style>
