import Vue from 'vue'
import Login from '../components/admin/login'
import Router from 'vue-router'
import Mall from '../components/page/mall'
import Home from '../components/admin/home'
import Welcome from '../components/admin/welcome'

Vue.use(Router)

const router = new Router({
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
    component: Home,
    redirect: '/Welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }]
  }]
})

router.beforeEach((to, before, next) => {
  if (to.path === '/login') return next()
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})

export default router
