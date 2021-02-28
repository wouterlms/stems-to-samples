<template>
  <transition name="wave-anim" appear>
    <span class="ripple-wave"></span>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class RippleWave extends Vue {
  created(): void {
    setTimeout(() => {
      this.end()
    }, 500)
  }
  end(): void {
    this.$emit('wave-end')
  }
}
</script>

<style scoped lang="scss">
.ripple-wave {
  position: absolute;
  top: 0;
  left: 0;

  width: 20px;
  height: 20px;

  background: $primary-light;
  border-radius: 50%;

  opacity: 0.25;

  pointer-events: none;
  z-index: 1;

  opacity: 0;
  transform: scale(2) translateZ(0);
}

.wave-anim-enter-active {
  transition: 0.5s;
  transition-property: opacity, transform;
  will-change: opacity, transform;
}
.wave-anim-enter {
  opacity: 0.26;
  transform: scale(0.26) translateZ(0);
}
</style>
