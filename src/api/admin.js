import request from '@/utils/request'

const ADMIN_URL = '/admin'

export function commonQuery(adminQuery) {
  return request({
    url: ADMIN_URL,
    method: 'get',
    params: adminQuery
  })
}

export function add(admin) {
  return request({
    url: ADMIN_URL,
    method: 'post',
    data: admin
  })
}

export function queryAdminById(id) {
  return request({
    url: ADMIN_URL + '/' + id,
    method: 'get'
  })
}

export function modify(admin) {
  return request({
    url: ADMIN_URL,
    method: 'put',
    data: admin
  })
}

export function remove(id) {
  return request({
    url: ADMIN_URL,
    method: 'delete',
    params: {
      id: id
    }
  })
}
