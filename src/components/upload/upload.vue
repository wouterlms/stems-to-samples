<template>
  <div>
    <button-element @click="browse">Upload</button-element>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import fileInputMixin from '@/mixins/file-input.mixin'

@Component
export default class extends Mixins(fileInputMixin) {
  browse(): void {
    this._browse(['audio/mpeg', 'audio/x-aiff', 'audio/wav', 'audio/webm'], true, (files: File[]) => {
      this.$store.commit('setStems', files)
      this.$router.push('/analyse')
    })
  }
}
</script>

<style scoped></style>
