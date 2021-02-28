<template>
  <!-- <button-ripple :disabled="disabled || loading"> -->
  <button
    v-bind="$attrs"
    class="button"
    :class="[
      {
        'state-loading': loading,
        'state-plain': plain,
        'button--round': round,
        'button--rounded': rounded
      }
    ]"
    :style="buttonStyle"
    :disabled="disabled"
    v-on="listeners"
  >
    <span class="button__content">
      <icon-element v-if="icon" :icon="icon" class="button__content__icon" />
      <span v-if="$slots.default">
        <slot />
      </span>
      <loader-element v-if="loading" class="button__content__loader" :color="loaderColor" />
      <icon-element v-if="suffixIcon" :icon="suffixIcon" class="button__content__suffix-icon" />
    </span>
  </button>
  <!-- </button-ripple> -->
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import buttonRipple from '../ripple/ripple.vue'
import iconElement from '../icon/icon.vue'
import loaderElement from '../loader/loader.vue'

enum UIType {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger'
}

// @ts-ignore
import variables from '@/assets/scss/_variables.scss'

@Component({
  components: {
    buttonRipple,
    iconElement,
    loaderElement
  }
})
export default class Button extends Vue {
  /** Button type - 'success' | 'warning' | 'danger' | '' */
  @Prop() private readonly uiType!: string | UIType

  /** Button icon */
  @Prop() private readonly icon!: string

  /** Button suffix icon */
  @Prop() private readonly suffixIcon!: string

  /** Icon size */
  @Prop({ default: '0.9em' }) private readonly iconSize!: string

  /** Show button loader */
  @Prop() private readonly loading!: boolean

  /** Secondary button (UI) */
  @Prop() private readonly secondary!: boolean

  /** Rounded button */
  @Prop() private readonly rounded!: boolean

  /** Round button */
  @Prop() private readonly round!: boolean

  /** Plain button (text only) */
  @Prop() private readonly plain!: boolean

  /** Custom color */
  @Prop() private readonly color!: string

  /** Disabled */
  @Prop() private readonly disabled!: boolean

  get listeners(): any {
    return this.$listeners
  }

  get buttonStyle(): any {
    let colors: any = {}

    if (this.secondary) {
      colors = {
        '--color': this.buttonColor,
        '--background-color': 'transparent',
        '--border-color': this.buttonColor
      }
    } else {
      colors = {
        '--color': this.plain ? this.buttonColor : variables.primaryLight,
        '--background-color': this.buttonColor,
        '--border-color': this.buttonColor
      }
    }

    return {
      ...colors,
      '--icon-size': this.iconSize
    }
  }

  get loaderColor(): string {
    return this.secondary || this.plain ? this.buttonColor : variables.primaryLight
  }

  get buttonColor(): string {
    if (this.color) {
      return this.color
    }
    switch (this.uiType) {
      case UIType.SUCCESS:
        return variables.success
      case UIType.WARNING:
        return variables.warning
      case UIType.DANGER:
        return variables.error
      default:
        return variables.primaryAccent
    }
  }
}
</script>

<style scoped lang="scss">
$button-color: $primary-light;
$button-background: $primary-accent;

$padding-y: 0.8em;
$padding-x: 1.2em;

$transition: 0.3s;

.button {
  position: relative;
  display: inline-block;

  padding: $padding-y $padding-x;
  border-radius: $border-radius;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  font-family: inherit;

  user-select: none;
  transition: 0.3s;

  &:not(:disabled):not(.state-loading):active {
    opacity: 0.8;
    transition-delay: 0.15s; // for ripple
  }

  @include when(plain) {
    border-color: transparent;
    background: transparent;
  }

  @include when(loading) {
    cursor: not-allowed;

    .button {
      &__content {
        span,
        &__icon,
        &__suffix-icon {
          opacity: 0;
        }
      }
    }
  }

  &--round {
    padding: $padding-x;
    border-radius: 50%;
  }

  &--rounded {
    border-radius: $border-radius-lg * 2;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;

    span {
      font-weight: 500;
      font-size: 1em;
      white-space: nowrap;

      color: var(--color);
    }

    &__icon,
    &__suffix-icon {
      fill: var(--color);
      width: var(--icon-size) !important;
      height: var(--icon-size) !important;
      box-sizing: content-box;
    }

    &__icon ~ span {
      padding-left: calc(#{$padding-x} / 2);
    }

    span + &__suffix-icon {
      padding-left: calc(#{$padding-x} / 2);
    }

    &__loader {
      position: absolute;
      top: 50%;
      left: 50%;

      transform: translate(-50%, -50%);
    }
  }
}
</style>
