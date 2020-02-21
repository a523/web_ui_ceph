import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60 * 6 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      config.headers.Authorization = 'Bearer' + ' ' + getToken()
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    return response.data
  },
  error => {
    // 401、403、500等异常统一处理， 其他一起抛出视图处理
    const resp = error.response
    if (resp.status === 401) {
      if (resp.config.url === process.env.VUE_APP_BASE_API + '/api/token/') {
        Message({
          message: resp.data.detail || error.message,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(resp.data.detail || error.message))
      } else {
        // 刷新token
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
    } else if (resp.status === 403) {
      error.detail = resp.data.detail || 'Permission denied'
    } else if (resp.status >= 500) {
      error.detail = resp.data || '内部错误，请报告管理员'
      console.debug(error)
    }
    return Promise.reject(error)
  }
)

export default service
