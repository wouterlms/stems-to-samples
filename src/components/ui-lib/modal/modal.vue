<template>
  <aside class="modal">
    <!-- overlay -->
    <transition name="overlay" appear>
      <div v-if="isAlive" class="modal__overlay" @click="clickOutside"></div>
    </transition>

    <transition name="modal" appear @after-leave="$emit('close')">
      <div v-if="isAlive" class="modal__content">
        <icon-element v-if="showClose" @click.native="close" icon="close" class="modal__content__close" />

        <!-- slot content -->
        <slot />
      </div>
    </transition>
  </aside>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import iconElement from '../icon/icon.vue'

@Component({
  components: {
    iconElement
  }
})
export default class extends Vue {
  /** Show modal */
  @Prop() private readonly show!: boolean

  /** Show close icon */
  @Prop({ default: true }) private readonly showClose!: boolean

  isAlive: boolean = false

  @Watch('show', { immediate: true })
  onShowChange(show: boolean): void {
    this.isAlive = show
  }

  clickOutside(): void {
    this.close()
  }

  close() {
    this.isAlive = false
  }
}
</script>

<style scoped lang="scss">
.modal {
  position: relative;
  z-index: 99;

  &__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background: rgba(0, 0, 0, 0.4);
  }

  &__content {
    position: fixed;
    top: 50%;
    left: 50%;

    min-width: 200px;
    overflow: hidden;

    background: $primary-light;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;

    transform: translate(-50%, -50%);

    &__close {
      position: absolute;
      top: 0.8em;
      right: 0.8em;

      width: 0.6rem !important;
      height: 0.7rem !important;

      cursor: pointer;
      user-select: none;
    }
  }
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.4s cubic-bezier(0.17, 0.67, 0.16, 0.99);
}
.overlay-enter,
.overlay-leave-to {
  opacity: 0;
}

.modal {
  &-enter-active,
  &-leave-active {
    transition: 0.4s cubic-bezier(0.22, 0.68, 0, 1.51);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.05) !important;
  }
}
</style>
