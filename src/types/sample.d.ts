export default interface Sample {
  stem: string
  average: number
  left: Float32Array
  right: Float32Array
  unique?: boolean
  offset: number
  groupId: number
}
