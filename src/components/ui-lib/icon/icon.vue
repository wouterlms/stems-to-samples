<template>
  <svg v-html="paths" :viewBox="viewBox"></svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Icon extends Vue {
  /** Svg icon name, without .svg */
  @Prop({ required: true }) private readonly icon!: string

  get svg(): SVGElement {
    return require(`!html-loader!@/assets/svg/${this.icon}.svg`)
  }

  get paths(): string {
    const svg: string = this.svg + ''
    const svgTag: string = svg.substring(svg.indexOf('<svg'))
    const svgCloseTagIndex: number = svgTag.indexOf('>')
    const paths = svgTag
      .substring(svgCloseTagIndex + 1)
      .replace('</svg>', '')
      .trim()

    return paths
  }

  get viewBox(): string {
    const svg: string = this.svg + ''
    const parts: string[] = svg.split('viewBox="')
    const end: number = parts[1].indexOf('"')

    return parts[1].slice(0, end)
  }
}
</script>

<style scoped></style>
