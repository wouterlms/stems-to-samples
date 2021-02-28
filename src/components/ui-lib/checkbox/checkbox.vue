<template>
  <input-wrapper-element
    class="checkbox"
    :error="error"
    :disabled="disabled"
    :class="{
      'state-checked': isChecked,
      'state-disabled': disabled,
      'state-error': error
    }"
    :fit-content="true"
  >
    <label class="checkbox__content">
      <span class="checkbox__content__input">
        <span>
          <icon-element icon="check" />
        </span>
        <input type="checkbox" :checked="isChecked" v-model="isChecked" :disabled="disabled" />
      </span>
      <span class="checkbox__content__label">
        <slot />
      </span>
    </label>
  </input-wrapper-element>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import inputWrapperElement from '../input-wrapper/input-wrapper.vue'
import iconElement from '../icon/icon.vue'

@Component({
  components: {
    inputWrapperElement,
    iconElement
  }
})
export default class Checkbox extends Vue {
  /** Checkbox bind value */
  @Prop({ required: true }) private readonly value!: boolean | any[]

  /** Checkbox value */
  @Prop() private readonly label!: string

  /** Disable checkbox */
  @Prop() private readonly disabled!: boolean

  /** Show checkbox error */
  @Prop() private readonly error!: string | boolean

  get isChecked(): boolean {
    if (this.value instanceof Array) {
      return this.value.includes(this.label)
    }
    return this.value === true
  }

  set isChecked(isChecked: boolean) {
    if (this.disabled) {
      return
    }
    if (this.value instanceof Array) {
      const newValue = [...this.value]

      if (isChecked) {
        newValue.push(this.label)
      } else {
        newValue.splice(newValue.indexOf(this.label), 1)
      }

      this.$emit('input', newValue)
    } else {
      this.$emit('input', isChecked)
    }
  }
}
</script>

<style scoped lang="scss">
$checkbox-border-color--hover: $primary-accent;
$checkbox-background-color--selected: $primary-accent;
$checkbox-background-color--disabled: #edf2fc;
$transition: cubic-bezier(0.71, -0.46, 0.29, 1.46);

.checkbox {
  @include when(disabled) {
    .checkbox {
      &__content {
        cursor: not-allowed;

        &__input {
          span {
            background: $checkbox-background-color--disabled;
          }
        }
        &__label {
          color: $input-color--disabled;
        }
      }
    }
  }

  @include when(checked) {
    .checkbox {
      &__content {
        &__input {
          span {
            background: $checkbox-background-color--selected;
            border-color: $checkbox-border-color--hover;

            svg {
              transform: scale(1);
            }
          }
        }
      }
    }
  }

  @include when(error) {
    .checkbox {
      &__content {
        &__input {
          span {
            border-color: $error;
            background: $input-background-color;

            svg {
              fill: $error;
            }
          }
        }

        &__label {
          color: $error;
        }
      }
    }
  }

  &__content {
    display: flex;
    align-items: center;
    user-select: none;

    cursor: pointer;

    &__input {
      line-height: 0;

      span {
        display: flex;
        align-items: center;
        justify-content: center;

        border: 1px solid $border-color;
        border-radius: $border-radius-sm;

        background: $input-background-color;

        width: 1em;
        height: 1em;

        padding: 0.125em;
        box-sizing: border-box;

        z-index: 1;
        transition: 0.2s;

        svg {
          fill: $primary-light;
          transform: scale(0);
          transition: 0.3s $transition;
        }
      }
      input {
        display: none;
      }
    }

    &__label {
      margin-left: 0.4em;
    }
  }

  &:hover:not(.state-disabled):not(.state-error) &__content__input {
    span {
      border-color: $checkbox-border-color--hover;
    }
  }
}
</style>
