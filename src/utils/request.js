import axios from 'axios'
import {Message, MessageBox} from 'element-ui'
import store from '@/store'
import {getRefreshToken, getToken, setToken} from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
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
    const res = response.data

    console.log('拦截到响应：', res)

    // if the custom code is not 0, it is judged as an error.
    if (res.code !== 0) {
      if (res.code === 1003) {
        return refreshToken(response.config)
      }

      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
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
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

async function refreshToken(config) {
  // 刷新access_token
  const response = await axios.request({
    url: process.env.VUE_APP_BASE_API + '/admin/loginFromBackstage/refresh',
    headers: { 'X-TOKEN': getRefreshToken() },
    method: 'get'
  })
  // 更新store中的access_token和存储在cookie中的access_token
  const newToken = response.data.data.access_token
  store.commit('user/SET_TOKEN', newToken)
  setToken(newToken)
  // 设置新的access_token到之前的请求头
  config.headers['X-Token'] = newToken
  const result = await axios.request(config)
  // 重新发起之前的请求，无感知刷新页面
  return result.data
}

export default service
