<template>
  <div class="color-picker" ref="colorpicker">
    <div
      class="color-picker__selector"
      :style="{
        background: hex
      }"
      @click="toggleDropdown"
    ></div>

    <tooltip-element
      v-if="showDropdown"
      reference="colorpicker"
      v-bind="$attrs"
      margin=".5em"
      @click-outside="showDropdown = false"
    >
      <div class="color-picker__dropdown">
        <div class="color-picker__dropdown__selection">
          <!-- color panel -->
          <color-panel class="color-picker__dropdown__panel" @sv="handleSv" :hsv="hsv"></color-panel>

          <!-- color slider -->
          <color-slider class="color-picker__dropdown__slider" @h="handleH" :hsv="hsv"></color-slider>
        </div>

        <div class="color-picker__dropdown__footer">
          <!-- hex / rgb select -->
          <select-element
            :options="colorOptions"
            v-model="selectedColorOption"
            label="name"
            class="color-picker__dropdown__footer__select"
            position="top"
          />

          <!-- rgb -->
          <input-element
            v-if="selectedColorOption.name === 'rgb'"
            :value="rgbString"
            class="color-picker__dropdown__footer__input"
            @keydown.enter="handleRgbEnter"
          />

          <!-- hex -->
          <input-element
            v-else-if="selectedColorOption.name === 'hex'"
            :value="hex"
            class="color-picker__dropdown__footer__input"
            @keydown.enter="handleHexEnter"
          />
        </div>
      </div>
    </tooltip-element>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import tooltipElement from '../tooltip/tooltip.vue'
import colorPanel from './color-picker-panel.vue'
import colorSlider from './color-picker-slider.vue'
import inputElement from '../input/input.vue'
import selectElement from '../select/select.vue'
import buttonElement from '../button/button.vue'

import { HSV, RGB } from './types'

import {
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  hexToRgb,
  rgbObjectToString,
  isValidRgb,
  isValidHex,
  rgbStringToObject
} from './color'

@Component({
  components: {
    tooltipElement,
    colorPanel,
    colorSlider,
    inputElement,
    selectElement,
    buttonElement
  }
})
export default class extends Vue {
  /** Hex color value */
  @Prop({ required: true }) private readonly value!: string

  hsv: HSV = { h: 0, s: 0, v: 0 }
  showDropdown: boolean = false

  colorOptions: any = [{ name: 'rgb' }, { name: 'hex' }]
  selectedColorOption = this.colorOptions[0]

  get rgb(): RGB {
    return hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v)
  }
  get rgbString(): string {
    return rgbObjectToString(this.rgb)
  }
  get hex(): string {
    return rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b)
  }

  @Watch('value', { immediate: true })
  onValueChange(value: string): void {
    if (value !== this.hex) {
      const rgb: RGB | null = hexToRgb(value)

      if (rgb) {
        this.hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      }
    }
  }

  @Watch('hsv', { deep: true })
  onHsvgChange(hsv: HSV): void {
    this.$emit('input', this.hex)
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown
  }

  handleSv({ s, v }: Partial<HSV>): void {
    this.hsv.s = s!
    this.hsv.v = v!
  }

  handleH({ h }: Partial<HSV>): void {
    this.hsv.h = h!
  }

  handleRgbEnter(e: InputEvent): void {
    const rgb: string = (e.target as HTMLInputElement).value

    if (isValidRgb(rgb)) {
      const rgbObj: RGB = rgbStringToObject(rgb)
      this.hsv = rgbToHsv(rgbObj.r, rgbObj.g, rgbObj.b)
    }
  }

  handleHexEnter(e: InputEvent): void {
    const hex = (e.target as HTMLInputElement).value

    if (isValidHex(hex)) {
      const rgbObj: RGB = hexToRgb(hex)!
      this.hsv = rgbToHsv(rgbObj.r, rgbObj.g, rgbObj.b)
    }
  }
}
</script>

<style scoped lang="scss">
.color-picker {
  position: relative;
  width: 2em;
  height: 2em;

  padding: 0.2em;
  border-radius: $border-radius;
  box-shadow: $box-shadow;

  &__selector {
    background: #000;
    border-radius: $border-radius-sm;
    width: 100%;
    height: 100%;

    cursor: pointer;
  }

  &__dropdown {
    width: 400px;
    padding: 0.5em;

    &__selection {
      display: flex;
      height: 300px;
    }

    &__panel,
    &__slider {
      height: 100%;
    }

    &__panel {
      flex: 0.97;
    }

    &__slider {
      flex: 0.03;
      margin-left: 0.5em;
    }

    &__footer {
      display: grid;
      grid-template-columns: 0.3fr 0.4fr 0.3fr;

      margin-top: 0.5em;

      &__input,
      &__select,
      button {
        font-size: 80%;
      }

      &__input {
        margin-left: 0.5em;
      }

      button {
        width: 80px;
        margin-left: auto;
      }
    }
  }
}
</style>
