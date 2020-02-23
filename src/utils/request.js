import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getAccessToken, getRefreshToken, setAccessToken, updateLastTime, inExpiration } from '@/utils/auth'
import { refreshToken } from '@/api/user'

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

    if (store.getters.access) {
      config.headers.Authorization = 'Bearer' + ' ' + getAccessToken()
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
        // 登录的时候，密码错误之类的
        Message({
          message: resp.data.detail,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(resp.data.detail || error.message))
      } else {
        if (resp.config.url === process.env.VUE_APP_BASE_API + '/api/refresh/') {
          MessageBox.alert('You have been logged out, you must log in again', 'Need Re-Login', {
            confirmButtonText: 'Re-Login',
            type: 'warning'
          }).then(() => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          })
        } else {
          // 刷新token
          if (inExpiration()) {
            const refresh = getRefreshToken()
            if (refresh) {
              refreshToken({ 'refresh': refresh }).then(rsp => {
                setAccessToken(rsp.access)
                resp.config.url = resp.config.url.replace(process.env.VUE_APP_BASE_API, '')
                return service(resp.config)
              })
            }
          } else {
            // 重新登录
            if (resp.config.url !== process.env.VUE_APP_BASE_API + '/user-admin/user-self/') {
              MessageBox.alert('You have been logged out, you must log in again', 'Need Re-Login', {
                confirmButtonText: 'Re-Login',
                type: 'warning'
              }).then(() => {
                store.dispatch('user/resetToken').then(() => {
                  location.reload()
                })
              })
            } else {
              store.dispatch('user/resetToken').then(() => {
                location.reload()
              })
            }
          }
        }
      }
    } else if (resp.status === 403) {
      error.detail = resp.data.detail || 'Permission denied'
      updateLastTime()
    } else if (resp.status >= 500) {
      error.detail = resp.data || '内部错误，请报告管理员'
      console.debug(error)
      updateLastTime()
    } else {
      updateLastTime()
    }
    return Promise.reject(error)
  }
)

export default service
