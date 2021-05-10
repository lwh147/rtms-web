import axios from 'axios'
import {Message} from 'element-ui'

const BAIDU_OPEN_API_FACE_USER = '/rest/2.0/face/v3/faceset/user'
// const BAIDU_OPEN_API_FACE_GROUP = '/rest/2.0/face/v3/faceset/group'
const BAIDU_OPEN_API_FACE = '/rest/2.0/face/v3/faceset/face'
const BAIDU_OPEN_API_FACE_SEARCH = '/rest/2.0/face/v3/search'

const BAIDU_OPEN_API_GET_TOKEN = '/oauth/2.0/token'

const GET_TOKEN_PARAMS = {
  grant_type: 'client_credentials',
  client_id: 'GYmnWyBhREin3H1lUa6vqNo0',
  client_secret: 'bWsTZg7Quc3ZDDUYwsQKdKVIIQKzrOWs'
}

const TOKEN = {
  access_token: ''
}

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// response interceptor
request.interceptors.response.use(
  response => {
    const res = response.data

    console.log('拦截到响应：', res)

    return res
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

request({
  url: BAIDU_OPEN_API_GET_TOKEN,
  method: 'post',
  params: GET_TOKEN_PARAMS
}).then((res) => {
  TOKEN.access_token = res.access_token
}).catch((e) => {
  console.log('获取百度token失败', e)
})

export function search(data) {
  return request({
    url: BAIDU_OPEN_API_FACE_SEARCH,
    method: 'post',
    params: TOKEN,
    data: data
  })
}

export function addUserFace(data) {
  return request({
    url: BAIDU_OPEN_API_FACE_USER + '/add',
    method: 'post',
    params: TOKEN,
    data: data
  })
}

export function updateUserFace(data) {
  return request({
    url: BAIDU_OPEN_API_FACE_USER + '/update',
    method: 'post',
    params: TOKEN,
    data: data
  })
}

export function deleteUser(data) {
  return request({
    url: BAIDU_OPEN_API_FACE_USER + '/delete',
    method: 'post',
    params: TOKEN,
    data: data
  })
}

export function getUserFaceList(data) {
  return request({
    url: BAIDU_OPEN_API_FACE + '/getlist',
    method: 'post',
    params: TOKEN,
    data: data
  })
}

export function deleteUserFace(data) {
  return request({
    url: BAIDU_OPEN_API_FACE + '/delete',
    method: 'post',
    params: TOKEN,
    data: data
  })
}

