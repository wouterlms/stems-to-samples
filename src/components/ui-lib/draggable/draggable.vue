<template>
  <ul class="draggable" @mousedown="handleMouseDown" ref="list">
    <slot :selected="selectedListItem" />

    <li class="draggable__cloned" ref="cloned" :style="clonedStyle"></li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

/**
 *
 *  bugs:
 *    margin / border werkt niet met height & offsetTop; alternatives?
 */

@Component
export default class extends Vue {
  @Prop() private readonly list!: any[]

  listEl!: HTMLElement
  clonedEl!: HTMLElement

  mouseX: number = 0
  mouseY: number = 0

  selectedListItem: any = null
  previousTargetIndex: number = -1

  listItemVariables: any[] = []
  tempList: any[] = []

  isMouseDown: boolean = false

  get renderedList(): any[] {
    return this.list
  }

  set renderedList(list: any[]) {
    this.$emit('input', list)
  }

  get clonedStyle(): any {
    return {
      top: `${this.mouseY}px`,
      left: `${this.mouseX}px`
    }
  }

  get listItemIndexByCurrentMouseOffset(): number {
    if (!this.listEl) {
      return -1
    }

    const mouseOffsetFromList: number = this.mouseY - this.listEl.offsetTop
    const hoveredListItemIndex: number = this.listItemVariables.indexOf(
      this.listItemVariables.find(
        (li) => mouseOffsetFromList > li.offsetTop && mouseOffsetFromList <= li.offsetTop + li.height
      )
    )

    return hoveredListItemIndex
  }

  mounted(): void {
    this.listEl = this.$refs.list as HTMLElement
    this.clonedEl = this.$refs.cloned as HTMLElement

    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)

    this.calculateListItemOffsets()
  }

  beforeDestroy(): void {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  calculateListItemOffsets(): void {
    const listItems = Array.from(this.listEl.querySelectorAll('.item'))

    this.listItemVariables = []

    listItems.forEach((listItem, i) => {
      const offsetTop = (listItem as HTMLElement).offsetTop
      const height = (listItem as HTMLElement).clientHeight

      this.listItemVariables.push({ offsetTop, height })
    })
  }

  handleMouseDown(e: MouseEvent): void {
    const target: HTMLElement = e.target as HTMLElement

    this.isMouseDown = true
    this.selectedListItem = this.list[this.listItemIndexByCurrentMouseOffset]

    if (this.selectedListItem) {
      this.tempList = [...this.list]
      this.clonedEl.innerHTML = target.innerHTML
    }
  }

  handleMouseMove(e: MouseEvent): void {
    this.mouseX = e.pageX
    this.mouseY = e.pageY

    if (this.isMouseDown && this.selectedListItem) {
      let targetIndex: number = this.listItemIndexByCurrentMouseOffset

      /** find out if mouse is above or under */
      if (targetIndex === -1) {
        const mouseOffsetFromList: number = this.mouseY - this.listEl.offsetTop

        if (mouseOffsetFromList <= 0) {
          targetIndex = 0
        } else {
          targetIndex = this.list.length - 1
        }
      }

      if (targetIndex !== this.previousTargetIndex || targetIndex === -1) {
        this.list.splice(this.list.indexOf(this.selectedListItem), 1)
        this.list.splice(targetIndex, 0, this.selectedListItem)

        this.previousTargetIndex = targetIndex
      }
    }
  }

  handleMouseUp(e: MouseEvent): void {
    this.isMouseDown = false
    this.selectedListItem = null
    this.clonedEl.innerHTML = ''

    this.calculateListItemOffsets()
  }
}
</script>

<style scoped lang="scss">
.draggable {
  position: relative;
  user-select: none;

  &__cloned {
    position: fixed;
    pointer-events: none;
  }
}
</style>
