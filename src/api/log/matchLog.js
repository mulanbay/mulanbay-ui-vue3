import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/matchLog/list',
    method: 'get',
    params: query
  })
}

export function getCompareData(id) {
  return request({
    url: '/matchLog/getCompareData',
    method: 'get',
    params: {
      id
    }
  })
}

export function statMatchLog(para) {
  return request({
    url: '/matchLog/stat',
    method: 'get',
    params: para
  })
}