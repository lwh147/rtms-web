import request from '@/utils/request'

const Picture_URL = '/v1/picture'

export function fileUpload(file) {
  return request({
    url: Picture_URL + '/batch/upload',
    method: 'post',
    headers: {			// 设置上传请求头
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: file
  })
}

export function removeImage(id, version) {
  return request({
    url: Picture_URL,
    method: 'delete',
    params: {
      id: id,
      version: version
    }
  })
}
export function batchAddPicture(addTemporaryDTO) {
  return request({
    url: Picture_URL + '/batch/add',
    method: 'post',
    data: addTemporaryDTO
  })
}
