import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/taskServer/list',
    method: 'get',
    params: query
  })
}


export function getTaskServerTree() {
  return request({
    url: '/taskServer/tree',
    method: 'get'
  })
}

export function deleteTaskServer(ids) {
  const data = {
      ids
  }
  return request({
    url: '/taskServer/delete',
    method: 'post',
    data
  })
}
