<template>
  <select-element class="tag-select" v-bind="$attrs" v-model="selectValue" :label="label" :disabled="disabled">
    <slot />
    <template slot="prepend">
      <tag-element v-for="(tag, i) of tags" :key="i" :tag="tag" @remove="remove" :label="label" :disabled="disabled" />
    </template>
  </select-element>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import tagElement from '../tag/tag.vue'
import selectElement from '../select/select.vue'

@Component({
  components: {
    tagElement,
    selectElement
  }
})
export default class extends Vue {
  @Prop({ required: true }) private readonly value!: any
  @Prop() private readonly label!: string
  @Prop() private readonly disabled!: boolean

  tags: any[] = []
  option: any | null = null
  selectValue: any = null

  @Watch('value', { immediate: true })
  onValueChange(value: any): void {
    this.tags = value
  }

  @Watch('selectValue')
  onSelectValueChange(value: any): void {
    if (value) {
      this.tags.push(value)
    }

    this.$nextTick(() => {
      this.selectValue = null
    })
  }

  @Watch('tags')
  onTagsChange(tags: any[]): void {
    this.$emit('input', tags)
  }

  addTag(): void {
    this.tags.push(this.option)
  }

  remove(tag: string): void {
    this.tags.splice(this.tags.indexOf(tag), 1)
  }
}
</script>

<style scoped lang="scss">
.tag-select {
  display: flex;
  flex-wrap: wrap;

  ::v-deep {
    label {
      @include scroll-bar;

      width: 100%;
      max-height: var(--max-height);
      display: flex;
      flex-wrap: wrap;
      border-radius: $border-radius;

      padding: $input-padding / 2;

      min-height: 2.7em;
      overflow: auto;
    }

    input {
      display: none;
    }

    .select__chevron {
      padding-left: $input-padding / 2;
      padding-right: $input-padding / 2;

      min-height: 1.9em;

      display: flex;
      align-items: center;
    }
  }
}
</style>
