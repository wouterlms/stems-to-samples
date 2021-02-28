import Sample from '@/types/sample'
import Stem from '@/types/stem'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stems: [] as File[],
    stemResults: [] as Stem[],
    exportSamples: [] as Sample[],

    // sample details
    sample: null as Sample | null,
    showSampleDetails: false as boolean
  },
  mutations: {
    setStems(state, stems: File[]) {
      state.stems = stems
    },
    setStemResults(state, stems: Stem[]) {
      state.stemResults = stems
    },
    addStemResult(state, stem: Stem) {
      state.stemResults.push(stem)
    },
    addExportSample(state, sample: Sample) {
      state.exportSamples.push(sample)
    },
    removeExportSample(state, sample: Sample) {
      state.exportSamples = state.exportSamples.filter(
        (_sample) => `${_sample.stem}-${_sample.offset}` !== `${sample.stem}-${sample.offset}`
      )
    },
    setSample(state, sample: Sample) {
      state.sample = sample
    },
    setShowSampleDetails(state, show: boolean) {
      state.showSampleDetails = show
    }
  },
  getters: {
    stems: (state) => {
      return state.stems
    },
    stemResults: (state) => {
      return state.stemResults
    },
    exportSamples: (state) => {
      return state.exportSamples
    },
    sample: (state) => {
      return state.sample
    },
    showSampleDetails: (state) => {
      return state.showSampleDetails
    }
  }
})
