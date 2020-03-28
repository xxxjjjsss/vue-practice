import Vue from 'vue'
import Login from '../components/admin/login'
import Router from 'vue-router'
import Mall from '../components/page/mall'
import Home from '../components/admin/home'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'mall',
    component: Mall
  }, {
    path: '/login',
    name: 'login',
    component: Login
  }, {
    path: '/home',
    name: 'home',
    component: Home
  }]
})
