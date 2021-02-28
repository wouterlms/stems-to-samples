<template>
  <div class="loader" :style="style">
    <svg class="loader__circular" viewBox="25 25 50 50">
      <circle
        class="loader__circular__path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="2"
        stroke-miterlimit="10"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

// @ts-ignore
import variables from '@/assets/scss/_variables.scss'

@Component
export default class Loader extends Vue {
  /** Loader size */
  @Prop({ default: '1.2em' }) private readonly size!: string

  /** Loader stroke color */
  @Prop({ default: variables.primaryAccent }) private readonly color!: string

  get style(): any {
    return {
      '--size': this.size,
      '--stroke': this.color
    }
  }
}
</script>

<style scoped lang="scss">
.loader {
  position: relative;
  margin: 0 auto;
  width: var(--size) !important;
  height: var(--size) !important;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  &__circular {
    animation: rotate 2s linear infinite;
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;

    &__path {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
      stroke-linecap: round;
      stroke: var(--stroke);
    }
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>
