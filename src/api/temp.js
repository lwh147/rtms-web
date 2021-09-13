import request from '@/utils/request'

export function add(data) {
  return request({
    url: '/tempInfo',
    method: 'post',
    data
  })
}
