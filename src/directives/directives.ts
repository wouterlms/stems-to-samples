// @ts-nocheck
import Vue from 'vue'

Vue.directive('hover', {
  bind: function(el, binding) {
    el.mouseEnter = () => {
      binding.value(true)
    }

    el.mouseLeave = () => {
      binding.value(false)
    }

    el.addEventListener('mouseenter', el.mouseEnter)
    el.addEventListener('mouseleave', el.mouseLeave)
  },
  unbind: function(el) {
    el.removeEventListener('mouseenter', el.mouseEnter)
    el.removeEventListener('mouseleave', el.mouseLeave)
  }
})

// Vue.directive('click-outside', {
//   bind: function(el, binding, vnode) {
//     el.onBodyClick = (e) => {
//       binding.value(e)
//     }
//     el.onElClick = (e) => {
//       e.stopPropagation()
//     }
//     document.body.addEventListener('click', el.onBodyClick)
//     el.addEventListener('click', el.onElClick)
//   },
//   unbind: function(el, binding) {
//     document.body.removeEventListener('click', el.onBodyClick)
//     el.removeEventListener('click', el.onElClick)
//   }
// })
