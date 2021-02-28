<template>
  <div class="date-picker" ref="datepicker">
    <input-element
      readonly
      :value="selectedDateValue ? ' ' : ''"
      :icon="align === 'left' && showIcon ? 'calendar' : null"
      :suffix-icon="align === 'right' && showIcon ? 'calendar' : null"
      :title="title"
      :error="error"
      :disabled="disabled"
      :placeholder="placeholder"
      @mouseup.native="handleMouseUp"
    >
      <template slot="prepend">
        <div class="date-picker__results">
          <div class="date-picker__results__from" v-if="selectedDateValue">{{ selectedDateValue }}</div>
          <div class="date-picker__results__split" v-if="selectedDateValue && range">
            <icon-element icon="chevron-right" />
          </div>
          <div class="date-picker__results__to" v-if="selectedEndDateValue">{{ selectedEndDateValue }}</div>
        </div>
      </template>
    </input-element>
    <span
      class="date-picker__reset"
      :class="{ 'date-picker__reset--active': (range && selectedDate && selectedEndDate) || selectedDate }"
      role="button"
      @click="reset"
    >
      Reset
    </span>
    <tooltip-element
      v-if="showDropdown"
      reference="datepicker"
      margin=".5em"
      arrow-offset=".6em"
      :position="position"
      :align="align"
      :align-arrow="align"
      v-click-outside="() => (showDropdown = false)"
    >
      <div class="date-picker__dropdown">
        <!-- header -->
        <div class="date-picker__header">
          <div>
            <button-element icon="rewind" @click="prevYear" />
            <button-element icon="chevron-left" @click="prevMonth" />
          </div>

          <div class="date-picker__header__center">
            <span>{{ months[month - 1] }} {{ year }}</span>
          </div>

          <div>
            <button-element icon="chevron-right" @click="nextMonth" />
            <button-element icon="fast-forward" @click="nextYear" />
          </div>
        </div>

        <!-- days of week -->
        <ul class="date-picker__days-of-week">
          <li v-for="day of days" :key="day">
            {{ day }}
          </li>
        </ul>

        <ul class="date-picker__days-of-month">
          <date-picker-day
            v-for="day in indentationDays"
            :key="`prev${day}`"
            :day="daysOfPreviousMonth - indentationDays + day"
            :is-other-month="true"
          />
          <date-picker-day
            v-for="day of daysOfCurrentMonth"
            :key="day"
            :day="day"
            :selected-date="selectedDate"
            :selected-end-date="selectedEndDate"
            :hover-end-date="hoverEndDate"
            :month="month"
            :year="year"
            :range="range"
            @select="handleSelectDate"
            @selectEndDate="handleSelectEndDate"
            @hoverEndDate="handleHoverEndDate"
          />
          <date-picker-day v-for="day in nextMonthDays" :key="`next${day}`" :day="day" :is-other-month="true" />
        </ul>
      </div>
    </tooltip-element>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import buttonElement from '../button/button.vue'
import iconElement from '../icon/icon.vue'
import inputElement from '../input/input.vue'
import tooltipElement from '../tooltip/tooltip.vue'
import datePickerDay from './date-picker-day.vue'

@Component({
  components: {
    inputElement,
    tooltipElement,
    datePickerDay,
    iconElement,
    buttonElement
  }
})
export default class DatePicker extends Vue {
  @Prop({ required: true }) private readonly value!: Date | Object
  @Prop() private readonly range!: Boolean
  @Prop() private readonly rangeStart!: Date
  @Prop() private readonly rangeEnd!: Date
  @Prop() private readonly title!: string
  @Prop() private readonly error!: string
  @Prop() private readonly disabled!: boolean
  @Prop() private readonly placeholder!: boolean
  @Prop({ default: 'right' }) private readonly align!: string
  @Prop({ default: 'right' }) private readonly alignArrow!: string
  @Prop({ default: true }) private readonly showIcon!: boolean
  @Prop({ default: 'bottom' }) private readonly position!: string

  days: string[] = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  months: string[] = [
    'Januari',
    'Februari',
    'Maart',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Augustus',
    'September',
    'October',
    'November',
    'December'
  ]

  showDropdown: boolean = false

  year: number = new Date().getFullYear()
  month: number = new Date().getMonth() + 1

  selectedDate: Date | null = null
  selectedEndDate: Date | null = null
  hoverEndDate: Date | null = null

  get daysOfCurrentMonth(): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  get daysOfPreviousMonth(): number {
    return new Date(this.year, this.month === 0 ? 11 : this.month - 1, 0).getDate()
  }

  get daysOfNextMonth(): number {
    return new Date(this.year, this.month === 11 ? 0 : this.month + 1, 0).getDate()
  }

  get indentationDays(): number {
    return new Date(`${this.year}-${this.month}-01`).getDay()
  }

  get nextMonthDays() {
    if ((this.daysOfCurrentMonth + this.indentationDays) % 7 === 0) {
      return 0
    }
    const rows = Math.floor((this.daysOfCurrentMonth + this.indentationDays) / 7) + 1
    return 7 * rows - this.daysOfCurrentMonth - this.indentationDays
  }

  get selectedDateValue(): string | null {
    if (this.selectedDate) {
      return this.dateToString(this.selectedDate)
    }
    return null
  }

  get selectedEndDateValue(): string | null {
    if (this.selectedEndDate) {
      return this.dateToString(this.selectedEndDate)
    }
    return null
  }

  @Watch('value')
  onValueChange(date: Date | null): void {
    if (!this.range && date !== this.selectedDate) {
      this.selectedDate = date
    }
  }

  @Watch('rangeStart', { immediate: true })
  onRangeStartChange(date: Date | null): void {
    this.selectedDate = date
  }

  @Watch('rangeEnd', { immediate: true })
  onRangeEndChange(date: Date | null): void {
    this.selectedEndDate = date
  }

  @Watch('selectedDate')
  onSelectedDateChange(date: Date): void {
    if (!this.range) {
      this.$emit('input', date)
    } else {
      this.$emit('input', {
        startDate: date,
        endDate: this.selectedEndDate
      })
    }
  }

  @Watch('selectedEndDate')
  onSelectedEndDateChange(date: Date): void {
    this.$emit('input', {
      startDate: this.selectedDate,
      endDate: date
    })
  }

  prevYear(): void {
    this.year--
  }

  nextYear(): void {
    this.year++
  }

  prevMonth(): void {
    this.year = this.month === 1 ? this.year - 1 : this.year
    this.month = this.month === 1 ? 12 : this.month - 1
  }

  nextMonth(): void {
    this.year = this.month === 12 ? this.year + 1 : this.year
    this.month = this.month === 12 ? 1 : this.month + 1
  }

  reset(): void {
    this.selectedDate = null

    if (this.range) {
      this.selectedEndDate = null
    }
  }

  handleMouseUp(): void {
    this.showDropdown = this.disabled ? false : !this.showDropdown
  }

  handleSelectDate(day: number): void {
    if (day) {
      this.selectedDate = new Date(`${this.year}-${this.month}-${day}`)

      if (!this.range) {
        this.showDropdown = false
      }
    }
  }

  handleSelectEndDate(day: number | null): void {
    if (day) {
      this.selectedEndDate = new Date(`${this.year}-${this.month}-${day}`)
    } else {
      this.selectedEndDate = null
    }
  }

  handleHoverEndDate(day: number | null): void {
    if (day) {
      this.hoverEndDate = new Date(`${this.year}-${this.month}-${day}`)
    } else {
      this.hoverEndDate = null
    }
  }

  dateToString(date: Date): string {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }
}
</script>

<style scoped lang="scss">
.date-picker {
  position: relative;
  z-index: 1;

  &__reset {
    position: absolute;
    top: 0;
    right: 0.3em;

    font-size: 0.7rem;
    color: $border-color;
    pointer-events: none;

    transform: translate(0, calc(0.2em));
    cursor: pointer;

    transition: 0.2s;

    &--active {
      color: $input-color;
      pointer-events: all;
    }
  }

  &__results {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 $input-padding;

    &__from,
    &__to {
      padding: 0.3em;
      border: 1px solid $border-color;
      background: $input-background-color;
      border-radius: $border-radius;

      font-size: $font-xs;
      color: $input-color;
    }

    &__split {
      margin: 0 0.5em;
      display: flex;
      align-items: center;

      svg {
        fill: lighten($primary-dark, 40);
        height: 0.5rem !important;
        width: 0.5rem !important;
      }
    }
  }

  &__dropdown {
    padding: 1em;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 1em;

    &__center {
      display: flex;
      align-items: center;

      span {
        font-weight: 300;
        font-size: $font-sm;
      }
    }

    ::v-deep button {
      font-size: 50%;
      background: none;
      border: none;

      svg {
        width: 0.5rem !important;
        height: 0.5rem !important;
        fill: $secondary-text;
      }
    }
  }

  &__days-of-week,
  &__days-of-month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;

    li {
      padding: 0.7em;
    }
  }

  &__days-of-month {
    font-size: $font-sm;

    &:hover {
      .day {
        transition: 0.2s;
      }
    }
  }
}
</style>
