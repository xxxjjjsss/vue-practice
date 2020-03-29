import Vue from 'vue'
import App from './App'
import router from './router'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import '../node_modules/swiper/css/swiper.css'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

/*
import Vant from 'vant'
import '../node_modules/vant/lib/index.css'
Vue.use(Vant)
*/
import axios from 'axios'
import '../node_modules/vant/lib/index.css'
import {
  Button,
  Row,
  Col,
  Swipe,
  SwipeItem,
  Lazyload
} from 'vant'

axios.defaults.baseURL = 'https://healthkiwi.co.nz/wp-json/jwt-auth/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  // config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.use(Button).use(Row).use(Col).use(Swipe).use(SwipeItem).use(Lazyload).use(VueAwesomeSwiper)
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$message = Message
axios.interceptors.response.use(data => {
  if (data.status && data.status === 200 && data.data.status === 'error') {
    Message.error({ message: data.data.msg })
    return
  }
  return data
}, err => {
  if (err.response.status === 504 || err.response.status === 404) {
    Message.error({ message: '服务器被吃了⊙﹏⊙∥' })
  } else if (err.response.status === 403) {
    Message.error({ message: '用户名或密码错误，请重试' })
  } else {
    Message.error({ message: '未知错误!' })
  }
  return Promise.resolve(err)
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>'
})
