import {
  domain
} from './utls.js'
import Axios from 'axios'
Axios.defaults.baseWooURL = domain.Base_WOO_URL
Axios.defaults.baseCin7URL = domain.Base_CI7_URL
Axios.defaults.timeout = 180000

function paramsToUrl(url, params) {
  if (!params) return url
  for (var key in params) {
    if (params[key] && params[key] !== 'undefined') {
      if (url.indexOf('?') !== -1) {
        url += '&' + '' + key + '=' + params[key] || '' + ''
      } else {
        url += '?' + '' + key + '=' + params[key] || '' + ''
      }
    }
  }
  return url
}

function requireData(url, params, type, item) {
  if (!url) return false
  switch (item) {
    case 'M1':
      url = Axios.defaults.baseWooURL + url
      break
    case 'M2':
      url = Axios.defaults.baseCin7URL + url
  }
  if (type === 'get') {
    url = paramsToUrl(url, params)
    return new Promise((resolve, reject) => {
      Axios.get(url, params).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  } else {
    return new Promise((resolve, reject) => {
      Axios.post(url, params).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default {
  install(Vue, options) {
    // ->接口1的请求数据方法
    Vue.prototype.reqWooService = function (url, params, type) {
      return requireData.call(this, url, params, type, 'M1')
    }
    // ->接口2的请求数据方法
    Vue.prototype.reqCin7Service = function (url, params, type) {
      return requireData.call(this, url, params, type, 'M2')
    }
  }

}
