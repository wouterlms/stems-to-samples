<template>
  <li
    class="option"
    @click.stop="selectOption"
    :class="{
      'state-disabled': isDisabled,
      'state-selected': isSelected
    }"
  >
    <slot :selected="isSelected" />
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'Option'
})
export default class Option extends Vue {
  /** Option value */
  @Prop({ required: true }) private readonly value!: any

  /** Disable option */
  @Prop() private readonly disabled!: boolean

  selectedOption: any = null

  get isDisabled(): boolean {
    return this.disabled || this.value.disabled
  }

  get isSelected(): boolean {
    return JSON.stringify(this.selectedOption) === JSON.stringify(this.value)
  }

  mounted(): void {
    this.$on('optionSelected', this.handleOptionSelected)
  }

  beforeDestroy(): void {
    this.$off('optionSelected', this.handleOptionSelected)
  }

  handleOptionSelected(option: any): void {
    this.selectedOption = option
  }

  selectOption(): void {
    if (!this.disabled) {
      let parent = this.$parent || this.$root
      let name = parent.$options.name

      while (parent && (!name || name !== 'Select')) {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.name
        }
      }
      if (parent) {
        // @ts-ignore
        parent.$emit.apply(parent, ['optionClicked'].concat(this.value))
      }
    }
  }
}
</script>

<style scoped lang="scss">
.option {
  position: relative;
  padding: 0.9em;
  text-align: left;

  background: $primary-light;
  color: $primary-text;
  transition: 0.3s;

  cursor: pointer;
  user-select: none;
  overflow: hidden;

  @include when(selected) {
    // ...
  }

  @include when(disabled) {
    color: $input-color--disabled;
    cursor: not-allowed;

    &:hover {
      background: inherit;
    }
  }

  &:hover {
    background: transparentize($primary-accent, 0.9);
  }
}
</style>
