<template>
  <transition name="transition">
    <div class="details" v-if="showSampleDetails">
      id: {{ sample.stem }}-{{ sample.offset }}
      <button-element class="details__close" icon="close-bold" :round="true" ui-type="danger" @click="close" />
      <button-element @click="toggleMarkForExport">
        {{ isInExportArray ? 'Remove from export' : 'Mark for export' }}
      </button-element>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

import Sample from '@/types/sample'

@Component({
  computed: mapGetters(['showSampleDetails', 'sample', 'exportSamples'])
})
export default class extends Vue {
  sample!: Sample
  exportSamples!: Sample[]

  get isInExportArray(): boolean {
    return !!this.exportSamples.find((sample) => sample.offset === this.sample.offset)
  }

  close(): void {
    this.$store.commit('setShowSampleDetails', false)
  }

  toggleMarkForExport(): void {
    if (this.isInExportArray) {
      this.$store.commit('removeExportSample', this.sample)
    } else {
      this.$store.commit('addExportSample', this.sample)
    }
  }
}
</script>

<style scoped lang="scss">
.details {
  position: fixed;
  top: 0;
  right: 0;

  width: 400px;
  height: 100%;

  padding: 1rem;

  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);

  border-left: 1px solid $border-color;

  z-index: 5;

  &__close {
    font-size: 50%;
  }
}

.transition {
  &-enter-active,
  &-leave-active {
    transition: 0.5s cubic-bezier(0.17, 0.67, 0.16, 0.99);
  }

  &-enter,
  &-leave-to {
    transform: translateX(100%);
  }
}
</style>
