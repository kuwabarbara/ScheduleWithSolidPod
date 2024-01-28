import Vue from 'vue'
import VueRouter from 'vue-router'
import Kuwa from '../views/Kuwa.vue'
import Bara from '../views/Bara.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/kuwa',
    name: 'Kuwa',
    component: Kuwa
  },
  {
    path: '/',
    name: 'Bara',
    component: Bara
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
