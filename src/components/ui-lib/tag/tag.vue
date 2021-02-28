<template>
  <div class="tag" @mouseup.stop.prevent="!disabled && $emit('remove', tag)" :class="{ 'state-disabled': disabled }">
    <span>{{ computedTag }}</span>
    <icon-element icon="close" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import iconElement from '../icon/icon.vue'

@Component({
  components: {
    iconElement
  }
})
export default class Tag extends Vue {
  @Prop({ required: true }) private readonly tag!: any
  @Prop() private readonly disabled!: boolean
  @Prop() private readonly label!: string

  get computedTag(): string {
    if (this.label) {
      return this.tag[this.label]
    }
    return this.tag
  }
}
</script>

<style scoped lang="scss">
.tag {
  display: flex;
  align-items: center;

  width: fit-content;

  background: $input-background-color--disabled;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;

  color: $input-color;

  padding: 0.3em;
  margin: 0.1em;

  font-size: $font-sm;

  user-select: none;
  white-space: nowrap;

  @include when(disabled) {
    opacity: 0.5 !important;
  }

  svg {
    margin-left: 0.5em;

    width: 0.5em !important;
    height: 0.5em !important;

    background: $input-placeholder-color--disabled;
    fill: $primary-dark;

    padding: 0.2em;
    box-sizing: content-box;
    border-radius: 50%;
  }
}
</style>
