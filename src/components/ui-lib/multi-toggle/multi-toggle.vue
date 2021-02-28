<template>
  <div class="multi-toggle" :class="{ 'state-disabled': disabled }">
    <ul ref="options">
      <div class="multi-toggle__highlight" :style="highlightedOptionStyle"></div>
      <li
        class="multi-toggle__option"
        v-for="(option, i) of options"
        :key="i"
        :class="{ 'multi-toggle__option--selected': selectedOptionIndex === i }"
        role="button"
        @click="select(option)"
      >
        <template v-if="label">{{ option[label] }}</template>
        <template v-else>{{ option }}</template>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component
export default class extends Vue {
  /** Multi toggle value */
  @Prop({ required: true }) private readonly value!: any

  /** Multi toggle options */
  @Prop({ required: true }) private readonly options!: any[]

  /** Property used to display value if object array is used */
  @Prop() private readonly label!: string

  @Prop() private readonly disabled!: boolean

  selectedOption: any = null
  optionWidths: any[] = []
  initialised: boolean = false

  get selectedOptionIndex(): number {
    if (this.label) {
      if (!this.selectedOption) {
        return -1
      }
      return this.options.findIndex((tab) => tab[this.label] === this.selectedOption[this.label])
    }
    return this.options.findIndex((tab) => tab === this.selectedOption)
  }

  get highlightedOptionStyle(): any {
    return {
      width: `${this.optionWidths[this.selectedOptionIndex]?.width || 0}px`,
      transform: `translate3d(${this.optionWidths[this.selectedOptionIndex]?.left || 0}px, 0, 0)`,
      transition: this.initialised ? ' 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)' : null
    }
  }

  @Watch('value', { immediate: true })
  onValueChange(value: any): void {
    if (value) {
      this.selectedOption = value
    }
  }

  @Watch('selectedOption', { immediate: true })
  onSelectedTabChange(tab: any): void {
    this.$emit('input', tab)
  }

  mounted(): void {
    this.setOptionsWidths()
    window.addEventListener('resize', this.handleWindowResize)

    setTimeout(() => {
      this.initialised = true
    }, 50)
  }

  beforeDestroy(): void {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize(): void {
    this.setOptionsWidths()
  }

  setOptionsWidths(): void {
    const optionsEl: HTMLElement = this.$refs.options as HTMLElement

    this.optionWidths = []

    Array.from(optionsEl.querySelectorAll('li')).forEach((tabEl, i) => {
      this.optionWidths[i] = {
        width: tabEl.clientWidth,
        left: tabEl.offsetLeft
      }
    })
  }

  select(option: string): void {
    if (!this.disabled) {
      this.selectedOption = option
    }
  }
}
</script>

<style scoped lang="scss">
.multi-toggle {
  display: inline-block;

  border-radius: $border-radius-xl;
  user-select: none;

  overflow: hidden;

  box-shadow: $box-shadow;
  background: $primary-light;

  @include when(disabled) {
    * {
      cursor: not-allowed;
    }
  }

  &__highlight {
    position: absolute;
    background: $primary-light;
    height: 100%;
    border-radius: $border-radius-xl / 1.25;
    box-shadow: $box-shadow;
  }

  ul {
    position: relative;
    display: flex;
    align-items: center;

    margin: 0.25em;
  }

  &__option {
    padding: 0.6em 1.4em;
    font-weight: 500;

    z-index: 1;

    transition: 0.3s ease-in-out;

    &--selected {
      color: $primary-accent;
    }
  }
}
</style>
