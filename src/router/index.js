import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import SignIn from '../views/SignIn.vue'
import UserDetail from '../views/UserDetail.vue'
import Kuwa from '../views/Kuwa.vue'
import Bara from '../views/Bara.vue'
import firebase from "firebase/compat/app";
import "firebase/compat/auth";


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: (to, from, next) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          console.log(user)
          next()
        } else {
          next("/signin");
        }
      });
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: "/register",
    name: "register",
    component: Register
  },
  {
    path: "/signin",
    name: "signIn",
    component: SignIn
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail
  },
  {
    path: '/kuwa',
    name: 'Kuwa',
    component: Kuwa
  },
  {
    path: '/bara',
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
