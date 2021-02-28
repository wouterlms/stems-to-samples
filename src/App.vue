<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif !important;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

button:focus {
  outline: none;
}

span {
  line-height: 1;
}

b {
  font-weight: bold !important;
}

img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.overflow-y-auto {
  @include scroll-bar;
}
</style>
