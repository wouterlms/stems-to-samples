<template>
  <label
    class="slider"
    :class="{
      'state-switched': isSwitched,
      'state-error': error,
      'state-disabled': disabled
    }"
  >
    <span v-if="inactiveText" class="slider__inactive">
      {{ inactiveText }}
    </span>

    <span class="slider__input">
      <input type="checkbox" v-model="isSwitched" :disabled="disabled" />
    </span>

    <div class="slider__slider"></div>

    <span v-if="activeText" class="slider__active">
      {{ activeText }}
    </span>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class SwitchElement extends Vue {
  /** Slider value */
  @Prop({ required: true }) private readonly value!: boolean

  /** Active text */
  @Prop() private readonly activeText!: string

  /** Inactive text */
  @Prop() private readonly inactiveText!: string

  /** Error */
  @Prop() private readonly error!: boolean

  /** Disabled */
  @Prop() private readonly disabled!: boolean

  get isSwitched(): boolean {
    return !!this.value
  }

  set isSwitched(isSwitched: boolean) {
    if (!this.disabled) {
      this.$emit('input', isSwitched)
    }
  }
}
</script>

<style scoped lang="scss">
$switch-background-color--inactive: #dddfe6;
$switch-background-color--active: $primary-accent;
$switch-background-color--disabled: #edf2fc;
$switch-width: 2.8em;
$transition: 0.3s;

.slider {
  display: flex;
  align-items: center;
  user-select: none;

  cursor: pointer;

  @include when(switched) {
    .slider {
      &__slider {
        background: $switch-background-color--active;

        &::before {
          transform: translateX($switch-width / 2);
        }
      }
    }
  }

  @include when(error) {
    .slider {
      &__active,
      &__inactive {
        color: $error;
      }
    }
  }

  @include when(disabled) {
    cursor: not-allowed;

    @include when(switched) {
      .slider__slider {
        background: lighten($switch-background-color--active, 20);
      }
    }

    .slider {
      &__active,
      &__inactive {
        color: $input-color--disabled;
      }
    }
  }

  input {
    display: none;
  }

  &__active,
  &__inactive {
    font-weight: 500;
    color: $primary-text;
  }

  &__inactive {
    margin-right: 0.5em;
  }

  &__active {
    margin-left: 0.5em;
  }

  &__slider {
    position: relative;
    width: $switch-width;
    height: $switch-width / 2;

    background: $switch-background-color--inactive;
    border-radius: $border-radius-lg;

    transition: $transition;

    &::before {
      content: '';

      position: absolute;
      top: 0.063em;
      left: 0.063em;

      width: $switch-width / 2 - 0.126em;
      height: $switch-width / 2 - 0.126em;

      border-radius: 50%;

      background: $primary-light;
      transition: $transition;
    }
  }
}
</style>
