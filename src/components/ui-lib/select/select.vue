<template>
  <div
    class="select"
    v-click-outside="() => (showDropdown = false)"
    :class="{
      'state-loading': loading,
      'state-disabled': disabled,
      'state-error': error,
      'state-focused': showDropdown
    }"
    ref="select"
  >
    <input-element
      :value="computedActualValue"
      :readonly="readonly"
      :loading="loading"
      :border="border"
      :disabled="disabled"
      :title="title"
      :error="error"
      :icon="icon"
      :placeholder="placeholder"
      @mouseup="handleInputClick"
      @keyup="handleQueryInput"
    >
      <!-- prepend -->
      <template slot="prepend">
        <slot name="prepend" />
      </template>

      <!-- append -->
      <template slot="append">
        <div class="select__chevron" v-show="!loading">
          <icon-element icon="chevron-down" width="0.7em" height="0.7em" />
        </div>
      </template>
    </input-element>

    <tooltip-element
      v-if="showDropdown"
      :inherit-reference-width="true"
      :position="positionAsString"
      :z-index="zIndex"
      reference="select"
      align-arrow="right"
      arrow-offset="0.55em"
      margin=".5em"
      class="select__options"
    >
      <ul v-if="options && options.length" ref="dropdown">
        <!-- options if label -->
        <template v-if="label">
          <option-element v-for="option of options" :value="option" :key="option[label]" :disabled="option.disabled">
            {{ option[label] }}
          </option-element>
        </template>

        <!-- options if no label -->
        <template v-else>
          <option-element v-for="option of options" :value="option" :key="option">
            {{ option }}
          </option-element>
        </template>
      </ul>

      <ul v-else ref="dropdown">
        <slot />
      </ul>
    </tooltip-element>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'

import inputElement from '../input/input.vue'
import tooltipElement from '../tooltip/tooltip.vue'
import optionElement from '../select/option.vue'
import iconElement from '../icon/icon.vue'

enum Position {
  TOP,
  BOTTOM
}

@Component({
  name: 'Select',
  components: {
    inputElement,
    tooltipElement,
    optionElement,
    iconElement
  }
})
export default class Select extends Vue {
  /** Select value */
  @Prop({ required: true }) private readonly value!: any

  /** Select options array */
  @Prop() private readonly options!: any[]

  /** Property used to display value if object array is used */
  @Prop() private readonly label!: string

  /** Allow user input */
  @Prop({ default: true }) private readonly readonly!: boolean

  /** Input icon */
  @Prop() private readonly icon!: string

  /** Input suffix icon */
  // @Prop() private readonly suffixIcon!: string

  /** Disable input */
  @Prop() private readonly disabled!: boolean

  /** Input title */
  @Prop() private readonly title!: string

  /** Show input error */
  @Prop() private readonly error!: string | boolean

  /** Input placeholder */
  @Prop() private readonly placeholder!: string

  /** Show input loader */
  @Prop() private readonly loading!: boolean

  /** Show border */
  @Prop({ default: true }) private readonly border!: boolean

  @Prop({ default: 1 }) private readonly zIndex!: number

  @Prop() private readonly beforeInput!: Function

  /** Dropdown position */
  // @Prop({ default: 'bottom' }) private readonly position!: string

  selectedOption: any = null
  showDropdown: boolean = false
  actualValue: any = this.value
  isQuery: boolean = false

  position: Position = Position.BOTTOM

  get computedActualValue(): string | null {
    if (!this.actualValue) {
      return null
    }
    if (typeof this.actualValue == 'string') {
      return this.actualValue
    } else if (this.actualValue[this.label]) {
      return this.actualValue[this.label]
    }
    return null
  }

  get positionAsString(): string {
    if (this.position === Position.TOP) {
      return 'top'
    }
    return 'bottom'
  }

  @Watch('value')
  onValueChange(value: any): void {
    this.actualValue = value
  }

  @Watch('showDropdown')
  onShowDropdownchange(show: boolean): void {
    if (show) {
      this.$nextTick(() => {
        const dropdown = this.$refs.dropdown as HTMLElement
        const select = this.$refs.select as HTMLElement

        if (
          window.innerHeight -
            select.getBoundingClientRect().top -
            select.getBoundingClientRect().height -
            dropdown.getBoundingClientRect().height -
            10 <=
          0
        ) {
          this.position = Position.TOP
        } else {
          this.position = Position.BOTTOM
        }
      })
    }
  }

  mounted(): void {
    this.$on('optionClicked', this.select)
    this.$on('closeDropdown', this.handleCloseDropdown)
  }

  beforeDestroy(): void {
    this.$off('optionClicked', this.select)
    this.$off('closeDropdown', this.handleCloseDropdown)
  }

  handleInputClick(): void {
    this.showDropdown = this.disabled || this.loading ? false : !this.showDropdown
  }

  select(option: any): void {
    this.isQuery = false
    this.showDropdown = false

    if (this.beforeInput) {
      this.selectedOption = this.beforeInput(option)
    } else {
      this.selectedOption = option
    }

    this.$emit('input', this.selectedOption)
  }

  handleCloseDropdown(): void {
    this.showDropdown = false
  }

  handleQueryInput(e: InputEvent): void {
    const value: string = (e.target as HTMLInputElement).value
    this.actualValue = value
    this.$emit('query', value)
  }
}
</script>

<style scoped lang="scss">
.select {
  position: relative;
  line-height: 1;

  ::v-deep .input__content__suffix-icon svg {
    width: 0.8em !important;
    transition: 0.3s;
  }

  @include when(loading) {
    cursor: not-allowed;
  }

  @include when(disabled) {
    cursor: not-allowed;
  }

  @include when(focused) {
    .select {
      &__chevron svg {
        transform: rotate(-180deg);
      }
    }
  }

  &__chevron {
    padding-right: $input-padding;
    margin-left: auto;

    svg {
      fill: $input-placeholder-color;
      transition: 0.3s;
    }
  }

  &__options {
    ul {
      @include scroll-bar;
      max-height: 300px;
      overflow-y: auto;
      border-radius: $border-radius;
    }
  }
}
</style>
