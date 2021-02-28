<template>
  <input-wrapper-element
    class="input"
    :class="{
      'state-disabled': disabled,
      'state-loading': loading,
      'state-error': error,
      'state-focused': isFocused,
      'state-read-only': readonly
    }"
    :title="title"
    :error="error"
    :disabled="disabled"
  >
    <label class="input__content" :style="borderStyle" @mouseup="$emit('mouseup')">
      <!-- prepend -->
      <slot
        name="prepend"
        :disabled="disabled"
        :loading="loading"
        :error="error"
        :focused="isFocused"
        :readonly="readonly"
      />

      <!-- icon -->
      <div v-if="icon" class="input__content__icon" @click.prevent>
        <icon-element :icon="icon" />
      </div>

      <textarea
        v-if="inputType === 'textarea'"
        :disabled="disabled || loading"
        :spellcheck="false"
        :readonly="readonly"
        :style="inputStyle"
        :value="actualValue"
        v-bind="$attrs"
        v-on="listeners"
        class="input__content__input"
      ></textarea>

      <input
        v-else
        :type="inputType"
        :disabled="disabled || loading"
        :spellcheck="false"
        :readonly="readonly"
        :style="inputStyle"
        :value="actualValue"
        v-bind="$attrs"
        v-on="listeners"
        class="input__content__input"
      />

      <!-- suffix icon -->
      <div v-if="computedSuffixIcon" class="input__content__suffix-icon" @click.prevent="handleSuffixIconClick">
        <icon-element :icon="computedSuffixIcon" />
      </div>

      <!-- append -->
      <slot
        name="append"
        :disabled="disabled"
        :loading="loading"
        :error="error"
        :focused="isFocused"
        :readonly="readonly"
      />

      <!-- loader -->
      <div v-if="loading" class="input__content__loader">
        <loader-element radius="1.3em" />
      </div>
    </label>
  </input-wrapper-element>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import inputWrapperElement from '../input-wrapper/input-wrapper.vue'
import iconElement from '../icon/icon.vue'
import loaderElement from '../loader/loader.vue'

@Component({
  inheritAttrs: false,
  components: {
    inputWrapperElement,
    iconElement,
    loaderElement
  }
})
export default class Input extends Vue {
  /** Input value */
  @Prop({ required: true }) private readonly value!: string | number

  /** Input type - 'text' | 'password' | 'number' | 'textarea */
  @Prop({ default: 'text' }) private readonly type!: string

  /** Input icon */
  @Prop() private readonly icon!: string

  /** Input suffix icon */
  @Prop() private readonly suffixIcon!: string

  /** Disable input */
  @Prop() private readonly disabled!: boolean

  /** Input title */
  @Prop() private readonly title!: string

  /** Show input error */
  @Prop() private readonly error!: string | boolean

  /** Show input loader */
  @Prop() private readonly loading!: boolean

  /** Make input readonly */
  @Prop() private readonly readonly!: boolean

  /** Show border */
  @Prop({ default: true }) private readonly border!: boolean

  /** Input height (used for textarea) */
  @Prop({ default: 'auto' }) private readonly height!: string

  /** Textarea resize - 'none' | 'horizontal' | 'vertical' | 'both' */
  @Prop({ default: 'none' }) private readonly resize!: string

  actualValue: string | number = this.value
  showPassword: boolean = false
  isFocused: boolean = false

  get componentType(): string {
    return this.type === 'textarea' ? 'textarea' : 'input'
  }

  get listeners(): any {
    return {
      ...this.$listeners,
      focus: (e: { target: HTMLInputElement | HTMLTextAreaElement }) => {
        this.$emit('focus', e)
        this.isFocused = true
      },
      blur: (e: { target: HTMLInputElement | HTMLTextAreaElement }) => {
        this.$emit('blur', e)
        this.isFocused = false
      },
      input: (e: { target: HTMLInputElement | HTMLTextAreaElement }) => {
        this.$emit('input', e.target!.value)
      },
      mouseup: (e: InputEvent) => {
        // without this, it will register double clicks
      }
    }
  }

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password'
    }
    return this.type
  }

  get inputStyle(): any {
    return {
      resize: this.resize,
      height: this.height
    }
  }

  get borderStyle(): any {
    return {
      'border-width': this.border ? '1px' : '0'
    }
  }

  get computedSuffixIcon() {
    return this.type === 'password' ? (this.showPassword ? 'eye-hide' : 'eye-view') : this.suffixIcon
  }

  @Watch('value')
  onValueChange(value: string): void {
    this.actualValue = value
  }

  @Watch('actualValue')
  onActualValueChange(value: string): void {
    this.$emit('input', value)
  }

  handleSuffixIconClick() {
    this.showPassword = !this.showPassword
  }
}
</script>

<style scoped lang="scss">
.input {
  display: flex;
  flex-direction: column;

  @include when(focused) {
    .input__content {
      border: 1px solid $border-color--focus;
    }
  }

  @include when(read-only) {
    .input__content {
      cursor: pointer;
    }
  }

  @include when(error) {
    .input__content {
      border: 1px solid $error;

      &__icon,
      &__suffix-icon {
        fill: $error;
      }
    }
  }

  @include when(disabled) {
    .input__content {
      background: $input-background-color--disabled;
      cursor: not-allowed;

      &__input {
        color: $input-color--disabled;

        @include placeholder {
          color: $input-placeholder-color--disabled;
        }
      }
    }
  }

  @include when(loading) {
    .input__content {
      cursor: not-allowed;
    }
  }

  &__content {
    position: relative;
    display: flex;
    align-items: center;

    border: 1px solid $border-color;
    border-radius: $border-radius;
    background: $input-background-color;

    transition: $input-transition;
    margin: 0;
    line-height: 1.2;

    cursor: pointer;

    &__icon,
    &__suffix-icon {
      // fill: $input-placeholder-color;
      // transition: $input-transition;
      // line-height: 0;

      svg {
        width: 0.9em !important;
        height: 0.9em !important;
      }
    }

    &__icon {
      padding-left: $input-padding;
    }

    &__suffix-icon {
      padding-right: $input-padding;
    }

    &__input {
      border: none;
      background: transparent;
      padding: $input-padding;
      color: $input-color;
      resize: none;

      font-family: inherit;
      font-size: inherit;

      width: 100%;
      min-width: 0;
      cursor: inherit !important;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type='number'] {
        -moz-appearance: textfield;
      }

      @include placeholder {
        color: $input-placeholder-color;
      }
    }

    &__loader {
      height: 100%;
      width: 2.5em;

      background: $input-background-color;
      border-radius: $border-radius;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
