import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sysLog/list',
    method: 'get',
    params: query
  })
}

export function getSysLog(id) {
  return request({
    url: '/sysLog/get',
    method: 'get',
    params: { id }
  })
}


export function getBeanDetail(id) {
  return request({
    url: '/sysLog/beanDetail',
    method: 'get',
    params: { id }
  })
}

export function getSysLogAnalyseStat(query) {
  return request({
    url: '/sysLog/analyseStat',
    method: 'get',
    params: query
  })
}
