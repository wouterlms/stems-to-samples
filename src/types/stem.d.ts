import Sample from './sample'

export default interface Stem {
  name: string
  duration: number
  stereo: boolean
  left: Float32Array
  right: Float32Array
  samples: Sample[]
}
