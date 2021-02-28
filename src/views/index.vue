<template>
  <div>
    <upload />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import upload from '@/components/upload/upload.vue'

@Component({
  components: {
    upload
  }
})
export default class extends Vue {}
</script>

<style scoped></style>
