import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import '@/directives/directives'
import clickOutsideDirective from '@/directives/click-outside'

Vue.directive('click-outside', clickOutsideDirective)

import buttonElement from '@/components/ui-lib/button/button.vue'
import iconElement from '@/components/ui-lib/icon/icon.vue'
import tooltipElement from '@/components/ui-lib/tooltip/tooltip.vue'

Vue.component('button-element', buttonElement)
Vue.component('icon-element', iconElement)
Vue.component('tooltip-element', tooltipElement)

// if (window.Worker) {
//   console.log('Web Worker is supported')

//   const worker = new Worker('./webworker.js')

//   worker.postMessage({ event: 'testEvent', a: 'hey' })
// }

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
