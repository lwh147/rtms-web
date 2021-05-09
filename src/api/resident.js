import request from '@/utils/request'

const RESIDENT_URL = '/resident'

export function commonQuery(residentQuery) {
  return request({
    url: RESIDENT_URL,
    method: 'get',
    params: residentQuery
  })
}

export function add(resident) {
  return request({
    url: RESIDENT_URL,
    method: 'post',
    data: resident
  })
}

export function queryResidentById(id) {
  return request({
    url: RESIDENT_URL + '/' + id,
    method: 'get'
  })
}

export function modify(resident) {
  return request({
    url: RESIDENT_URL,
    method: 'put',
    data: resident
  })
}

export function remove(id) {
  return request({
    url: RESIDENT_URL,
    method: 'delete',
    params: {
      id: id
    }
  })
}
