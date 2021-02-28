<template>
  <div
    class="input__wrapper"
    :class="{
      'state-disabled': disabled,
      'state-error': error
    }"
    :style="style"
  >
    <div class="input__wrapper__content" v-if="title || error">
      <span v-if="title" class="input__wrapper__content__title">
        {{ title }}
      </span>

      <div v-if="title && error && error.length" class="input__wrapper__content__divider"></div>

      <span v-if="error && error.length" class="input__wrapper__content__error">
        {{ error }}
      </span>
    </div>

    <!-- slot -->
    <slot />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class InputWrapper extends Vue {
  /** Title */
  @Prop() private readonly title!: string

  /** Error */
  @Prop() private readonly error!: string | boolean

  /** Disabled */
  @Prop() private readonly disabled!: boolean

  @Prop() private readonly fitContent!: boolean

  get style(): any {
    return {
      width: this.fitContent ? 'fit-content' : '100%'
    }
  }
}
</script>

<style scoped lang="scss">
.input__wrapper {
  @include when(disabled) {
    .input__wrapper__content {
      cursor: not-allowed;
      color: $input-color--disabled;
    }
  }

  @include when(error) {
    .input__wrapper__content {
      color: $error !important;
    }
  }

  &__content {
    position: relative;

    display: flex;
    align-items: center;

    font-size: 0.85em;
    text-align: left;
    color: $input-color;

    margin-bottom: 0.4em;

    &__divider {
      width: 1px;
      height: 0.8em;

      margin: 0 0.4em;

      background: $error;
    }
  }
}
</style>
