<template>
  <li
    class="day"
    :class="{
      'state-other-month': isOtherMonth,
      'state-selected': isSelected,
      'state-selected-end': isSelectedEnd,
      'state-between-range': isBetweenRange || isBetweenRangeHover,
      'state-range': (selectedDate && hoverEndDate) || selectedEndDate
    }"
    role="button"
    @click="select"
    v-hover="handleHover"
  >
    {{ day }}
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class DatePickerDay extends Vue {
  @Prop() private readonly day!: number
  @Prop() private readonly isOtherMonth!: boolean
  @Prop() private readonly selectedDate!: Date | null
  @Prop() private readonly selectedEndDate!: Date | null
  @Prop() private readonly hoverEndDate!: Date | null
  @Prop() private readonly year!: number
  @Prop() private readonly month!: number
  @Prop() private readonly range!: boolean

  get isSelected(): boolean {
    return (
      !!this.selectedDate &&
      this.selectedDate.getDate() === this.day &&
      this.selectedDate.getMonth() + 1 === this.month &&
      this.selectedDate.getFullYear() === this.year
    )
  }

  get isSelectedEnd(): boolean {
    return (
      !!this.selectedEndDate &&
      this.selectedEndDate.getDate() === this.day &&
      this.selectedEndDate.getMonth() + 1 === this.month &&
      this.selectedEndDate.getFullYear() === this.year
    )
  }

  get isBetweenRange(): boolean {
    const date: Date = new Date(`${this.year}-${this.month}-${this.day}`)
    return !!(this.selectedDate && this.selectedEndDate) && date > this.selectedDate && date < this.selectedEndDate
  }

  get isBetweenRangeHover(): boolean {
    const date: Date = new Date(`${this.year}-${this.month}-${this.day}`)
    if (!this.selectedDate || !this.hoverEndDate || this.selectedEndDate) {
      return false
    }
    return date > this.selectedDate && date <= this.hoverEndDate
  }

  handleHover(isHovered: boolean): void {
    if (isHovered && this.selectedDate && !this.selectedEndDate) {
      this.$emit('hoverEndDate', this.day)
    } else {
      this.$emit('hoverEndDate', null)
    }
  }

  select(): void {
    if (this.range) {
      if (!this.selectedDate && !this.selectedEndDate) {
        this.$emit('select', this.day)
      } else if (this.selectedDate && !this.selectedEndDate) {
        const endDayAsDate: Date = new Date(`${this.year}-${this.month}-${this.day}`)

        if (endDayAsDate > this.selectedDate) {
          this.$emit('selectEndDate', this.day)
        } else {
          this.$emit('select', this.day)
        }
      } else {
        this.$emit('select', this.day)
        this.$emit('selectEndDate', null)
      }
    } else {
      this.$emit('select', this.day)
    }
  }
}
</script>

<style scoped lang="scss">
.day {
  border-radius: $border-radius;
  cursor: pointer;

  @include when(other-month) {
    opacity: 0.3;
    pointer-events: none;
  }

  @include when(selected) {
    background: $primary-accent;
    color: $primary-light;
    box-shadow: $box-shadow;

    @include when(range) {
      border-radius: $border-radius 0 0 $border-radius;
    }
  }

  @include when(selected-end) {
    background: $primary-accent;
    color: $primary-light;
    box-shadow: $box-shadow;

    @include when(range) {
      border-radius: 0 $border-radius $border-radius 0;
    }
  }

  @include when(between-range) {
    border-radius: 0;
    background: transparentize($primary-accent, 0.9);
  }
}
</style>
