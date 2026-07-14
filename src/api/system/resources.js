import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/resources/list',
    method: 'get',
    params: query
  })
}

export function deleteResources(ids) {
  const data = {
      ids
  }
  return request({
    url: '/resources/delete',
    method: 'post',
    data
  })
}