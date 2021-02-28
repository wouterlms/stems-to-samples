<template>
  <input-element
    class="tag-input"
    v-model="inputValue"
    v-bind="$attrs"
    :disabled="disabled"
    @keydown="handleKeyDown"
    @click="scrollToBottom"
    :style="style"
  >
    <template slot="prepend">
      <tag-element v-for="tag of tags" :key="tag" :tag="tag" :disabled="disabled" @remove="remove" />
    </template>
  </input-element>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import inputElement from '../input/input.vue'
import tagElement from '../tag/tag.vue'

@Component({
  components: {
    inputElement,
    tagElement
  }
})
export default class TagInput extends Vue {
  @Prop({ required: true }) private readonly value!: string[]
  @Prop() private readonly disabled!: boolean
  @Prop() private readonly maxHeight!: string

  inputValue: string | null = null
  tags: string[] = []
  keys: number[] = [9, 13, 188]

  scrollContainer: HTMLElement | null = null

  get style(): any {
    return {
      '--max-height': this.maxHeight || 'auto'
    }
  }

  @Watch('tags')
  onTagsChange(tags: string[]) {
    this.$emit('input', tags)

    this.$nextTick(() => {
      this.scrollToBottom()
    })
  }

  @Watch('value', { immediate: true })
  onValueChange(value: string[]) {
    this.tags = value
  }

  @Watch('inputValue')
  onInputValueChange(): void {
    this.scrollToBottom()
  }

  mounted(): void {
    this.scrollContainer = document.querySelector('.input__content')
  }

  handleKeyDown(e: KeyboardEvent): void {
    if (this.keys.indexOf(e.keyCode) !== -1) {
      e.preventDefault()

      if (this.inputValue && this.inputValue.trim().length && this.tags.indexOf(this.inputValue) == -1) {
        this.addTag()
      }
    } else if (e.keyCode === 8 && !this.inputValue) {
      this.removeLastTag()
    }
  }

  addTag(): void {
    this.tags.push(this.inputValue!)
    this.inputValue = null
  }

  remove(tag: string): void {
    this.tags.splice(this.tags.indexOf(tag), 1)
  }

  removeLastTag(): void {
    this.tags.pop()
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight
    }
  }
}
</script>

<style scoped lang="scss">
.tag-input {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;

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
      padding: 0.17em 0 0.17em $input-padding / 4;
      border: 1px solid transparent;
      min-width: 40px;
      width: 1%;
      flex: auto;
    }
  }
}
</style>
