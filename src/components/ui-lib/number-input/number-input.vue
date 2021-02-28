<template>
  <input-element
    class="number-input"
    :value="modifiedValue"
    :disabled="disabled"
    :title="title"
    :error="error"
    :class="{ 'state-disabled': disabled }"
    @keydown.enter="handleUserInput"
    @blur="handleUserInput"
  >
    <template v-if="controls">
      <template slot="append">
        <div class="number-input__controls">
          <span role="button" @click.prevent="increase">
            <icon-element icon="chevron-up" />
          </span>
          <span role="button" @click.prevent="decrease">
            <icon-element icon="chevron-down" />
          </span>
        </div>
      </template>
    </template>
  </input-element>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import inputElement from '../input/input.vue'
import iconElement from '../icon/icon.vue'

@Component({
  components: {
    inputElement,
    iconElement
  }
})
export default class NumberInput extends Vue {
  /** Input value */
  @Prop({ required: true }) private readonly value!: string

  /** Minimum value */
  @Prop({ default: -Infinity }) private readonly min!: number

  /** Maximum value */
  @Prop({ default: Infinity }) private readonly max!: number

  /** Incremental step */
  @Prop({ default: 1 }) private readonly step!: number

  /** Precision */
  @Prop() private readonly precision!: number

  /** Disable input */
  @Prop() private readonly disabled!: boolean

  /** Title */
  @Prop() private readonly title!: string

  /** Error */
  @Prop() private readonly error!: string

  /** Prepend */
  @Prop() private readonly prepend!: string

  /** Append */
  @Prop() private readonly append!: string

  /** Show controls */
  @Prop({ default: true }) private readonly controls!: boolean

  actualValue: any = this.value

  get modifiedValue(): string {
    if (isNaN(parseFloat(this.actualValue))) {
      return `${this.prepend || ''}${this.append || ''}`
    }
    return `${this.prepend || ''}${parseFloat(this.actualValue).toFixed(this.precision)}${this.append || ''}`
  }

  @Watch('value')
  onValueChange(value: string): void {
    if (!this.disabled) {
      this.actualValue = isNaN(+value) ? this.min : value
    }
  }

  @Watch('actualValue')
  onActualValueChange(value: number): void {
    this.$emit('input', value)
  }

  decrease(): void {
    if (!this.disabled) {
      this.actualValue = parseFloat(this.actualValue) - this.step
      this.validate()
    }
  }
  increase(): void {
    if (!this.disabled) {
      this.actualValue = parseFloat(this.actualValue) + this.step
      this.validate()
    }
  }

  validate(): void {
    // otherwise watcher doesn't get emit the change
    // (e.g. if max value is 10; change value to 10+ twice in a row)
    // 2nd time change won't be emitted
    this.$nextTick(() => {
      this.actualValue = Math.min(Math.max(this.actualValue, this.min), this.max)
    })
  }

  handleUserInput(e: InputEvent): void {
    const value = parseFloat((e.target as HTMLInputElement).value.replace(/[^\d.]|\.(?=.*\.)/g, ''))

    /** NEEDS TESTING */
    if (parseFloat(this.actualValue) !== value) {
      this.actualValue = value
      this.validate()
    }

    ;(document.activeElement as HTMLElement).blur()
  }
}
</script>

<style scoped lang="scss">
.number-input {
  ::v-deep input {
    text-align: center;
  }

  @include when(disabled) {
    span {
      color: $input-color--disabled;
    }
  }

  @include when(disabled) {
    .number-input__controls {
      opacity: 0.6;

      span {
        cursor: not-allowed;
      }
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    align-self: stretch;

    border-radius: 0 $border-radius $border-radius 0;
    border-left: 1px solid $border-color;

    width: 4em;
    background: $input-background-color--disabled;

    transition: $input-transition;

    span {
      user-select: none;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 100%;
      height: 100%;

      svg {
        width: 0.6em !important;
        height: 0.6rem !important;
      }

      &:nth-of-type(1) {
        border-bottom: 1px solid $border-color;
      }

      // &:nth-of-type(1) {
      //   border-radius: $border-radius 0 0 $border-radius;
      //   border-right: 1px solid $border-color;
      //   left: 0;
      // }

      // &:nth-of-type(2) {
      //   border-radius: 0 $border-radius $border-radius 0;
      //   border-left: 1px solid $border-color;
      //   right: 0;
      // }
    }
  }
}
</style>
