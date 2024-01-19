import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/thread/list',
    method: 'get',
    params: query
  })
}

export function getThreadInfo(id) {
  return request({
    url: '/thread/info',
    method: 'get',
    params: { id }
  })
}
