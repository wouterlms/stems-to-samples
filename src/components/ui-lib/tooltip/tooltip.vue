<template>
  <transition name="tooltip-transition" appear @after-enter="handleAfterEnter" @before-leave="handleBeforeLeave">
    <div ref="tooltip" class="tooltip" :style="tooltipStyle" v-click-outside="() => $emit('click-outside')">
      <div class="tooltip__arrow" ref="tooltipArrow" :style="arrowStyle"></div>
      <div class="tooltip__shadow-layer" :style="shadowStyle"></div>
      <div class="tooltip__content" ref="tooltipContent" :style="contentStyle">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

enum Position {
  TOP = 'top',
  BOTTOM = 'bottom'
}

enum Align {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

enum TooltipState {
  ENTERING,
  VISIBLE,
  LEAVING
}

@Component
export default class Tooltip extends Vue {
  @Prop({ required: true }) private readonly reference!: string

  /** Position of tooltip - 'top' | 'bottom' */
  @Prop({ default: Position.BOTTOM }) private readonly position!: Position | string

  /** Alignment of tooltip - 'left' | 'right' | 'center' */
  @Prop({ default: Align.CENTER }) private readonly align!: Align | string

  /** Margin between tooltip and parent */
  @Prop({ default: '0px' }) private readonly margin!: string

  /** Content offset */
  @Prop({ default: '0px' }) private readonly offset!: string

  /** Inherit width of reference element */
  @Prop() private readonly inheritReferenceWidth!: boolean

  /** Alignment off tooltip arrow  - 'left' | 'right' | 'center' */
  @Prop({ default: Align.CENTER }) private readonly alignArrow!: Align | string

  /** Offset of tooltip arrow */
  @Prop({ default: '0px' }) private readonly arrowOffset!: string

  /** Arrow border radius */
  @Prop({ default: '0.150em' }) private readonly arrowBorderRadius!: string

  @Prop({ default: 2 }) private readonly zIndex!: number

  tooltipContentElement: HTMLElement | null = null
  tooltipArrowElement: HTMLElement | null = null
  referenceElement: HTMLElement | null = null

  referenceBoundingRect: DOMRect = new DOMRect()
  tooltipBoundingRect: DOMRect = new DOMRect()

  /** getBoundingClientRect takes in to account the rotation,  we don't want that */
  tooltipArrowWidth: number = 0
  tooltipArrowHeight: number = 0

  parent: any = null

  tooltipState: TooltipState = TooltipState.ENTERING

  get computedZIndex(): any {
    if (this.tooltipState === TooltipState.ENTERING) {
      return this.zIndex + 2
    } else if (this.tooltipState === TooltipState.VISIBLE) {
      return this.zIndex + 1
    } else {
      return this.zIndex
    }
  }

  get tooltipStyle(): any {
    return {
      '--z-index': this.computedZIndex
    }
  }

  get contentStyle(): any {
    const style: any = {}

    if (this.position === Position.TOP) {
      style.top = `calc(${this.referenceBoundingRect.top - this.tooltipBoundingRect.height}px - ${this.margin})`
    } else if (this.position === Position.BOTTOM) {
      style.top = `calc(${this.referenceBoundingRect.top + this.referenceBoundingRect.height}px + ${this.margin})`
    }

    /** CENTER */
    if (this.align === Align.CENTER) {
      style.left = `calc(${this.referenceBoundingRect.left +
        this.referenceBoundingRect.width / 2 -
        this.tooltipBoundingRect.width / 2}px + ${this.offset})`

      /** LEFT */
    } else if (this.align === Align.LEFT) {
      style.left = `calc(${this.referenceBoundingRect.left}px - ${this.offset})`

      /** RIGHT */
    } else if (this.align === Align.RIGHT) {
      style.left = `calc(${this.referenceBoundingRect.left +
        this.referenceBoundingRect.width -
        this.tooltipBoundingRect.width}px + ${this.offset})`
    }

    return {
      ...style,
      width: this.inheritReferenceWidth ? `${this.referenceBoundingRect.width}px` : 'auto'
    }
  }

  get shadowStyle(): any {
    return {
      ...this.contentStyle,
      width: `${this.tooltipBoundingRect.width}px`,
      height: `${this.tooltipBoundingRect.height}px`
    }
  }

  get arrowStyle(): any {
    const style: any = {}

    if (this.position === Position.TOP) {
      style.top = `calc(
        ${this.referenceBoundingRect.top - this.tooltipArrowHeight / 2}px - ${this.margin}
      )`
    } else if (this.position === Position.BOTTOM) {
      style.top = `calc(
        ${this.referenceBoundingRect.top + this.referenceBoundingRect.height - this.tooltipArrowHeight / 2}px + ${
        this.margin
      }
      )`
    }

    if (this.alignArrow === Align.CENTER) {
      style.left = `calc(${this.referenceBoundingRect.left +
        this.referenceBoundingRect.width / 2 -
        this.tooltipArrowWidth / 2}px + ${this.arrowOffset})`
    } else if (this.alignArrow === Align.LEFT) {
      style.left = `calc(${this.referenceBoundingRect.left}px + ${this.arrowOffset})`
    } else if (this.alignArrow === Align.RIGHT) {
      style.left = `calc(${this.referenceBoundingRect.left +
        this.referenceBoundingRect.width -
        this.tooltipArrowWidth}px - ${this.arrowOffset})`
    }

    return {
      ...style,
      ...this.calculateArrowBorderRadius,
      transform: 'rotate(45deg)'
    }
  }

  get calculateArrowBorderRadius() {
    return this.position === 'top'
      ? { borderBottomRightRadius: this.arrowBorderRadius }
      : { borderTopLeftRadius: this.arrowBorderRadius }
  }

  async mounted(): Promise<void> {
    this.parent = this.$parent

    /** Set tooltip element */
    this.tooltipContentElement = this.$refs.tooltipContent as HTMLElement

    /** Set tooltip arrow element */
    this.tooltipArrowElement = this.$refs.tooltipArrow as HTMLElement

    /** Set relative parent element */
    this.referenceElement = this.$parent.$refs[this.reference] as any

    let parent = this.$parent

    while (parent && this.referenceElement === undefined) {
      this.referenceElement = parent.$refs[this.reference] as any
      parent = parent.$parent
    }

    if (this.referenceElement instanceof Array) {
      this.referenceElement = this.referenceElement[0]
    }

    /** Append to body */
    document.body.appendChild(this.$refs.tooltip as HTMLElement)

    requestAnimationFrame(this.raf)
  }

  handleAfterEnter(): void {
    this.tooltipState = TooltipState.VISIBLE
  }

  handleBeforeLeave(): void {
    this.tooltipState = TooltipState.LEAVING
  }

  beforeDestroy(): void {
    if (this.parent._isBeingDestroyed) {
      this.$el.classList.add('tooltip-transition-leave-active', 'tooltip-transition-leave-to')

      this.$el.addEventListener(
        'transitionend',
        () => {
          document.body.removeChild(this.$el)
        },
        { once: true }
      )
    }
  }

  raf(): void {
    this.tooltipBoundingRect = this.tooltipContentElement!.getBoundingClientRect()
    this.referenceBoundingRect = this.referenceElement!.getBoundingClientRect()

    this.tooltipArrowWidth = this.tooltipArrowElement!.clientWidth
    this.tooltipArrowHeight = this.tooltipArrowElement!.clientHeight

    requestAnimationFrame(this.raf)
  }
}
</script>

<style scoped lang="scss">
.tooltip {
  position: relative;
  z-index: var(--z-index);

  &__arrow,
  &__content,
  &__shadow-layer {
    position: fixed;
  }

  &__arrow {
    background: $primary-light;
    box-shadow: $box-shadow;

    width: 0.625em;
    height: 0.625em;

    z-index: 2;
  }

  &__content {
    background: $primary-light;
    border-radius: $border-radius;
    color: $primary-dark;

    overflow: hidden;

    z-index: 3;
  }

  &__shadow-layer {
    background: $primary-light;
    border-radius: $border-radius;
    color: $primary-dark;

    box-shadow: $box-shadow;
  }
}

.tooltip-transition {
  &-enter-active,
  &-leave-active {
    transition: 0.3s cubic-bezier(0.17, 0.67, 0.16, 0.99);
  }

  &-enter-active {
    opacity: 0;
  }

  &-leave-active {
    opacity: 1;
    pointer-events: none;
  }

  &-leave-to {
    opacity: 0;
  }

  &-enter-to {
    opacity: 1;
  }
}
</style>
