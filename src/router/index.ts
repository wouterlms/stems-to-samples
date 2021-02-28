import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import index from '@/views/index.vue'
import analyse from '@/views/analyse.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: index
  },
  {
    path: '/analyse',
    component: analyse
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
