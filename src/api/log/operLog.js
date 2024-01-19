import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/operLog/list',
    method: 'get',
    params: query
  })
}

export function getOperLog(id) {
  return request({
    url: '/operLog/get',
    method: 'get',
    params: { id }
  })
}

export function getBeanDetail(id) {
  return request({
    url: '/operLog/beanDetail',
    method: 'get',
    params: { id }
  })
}

export function getOperLogTreeStat(query) {
  return request({
    url: '/operLog/treeStat',
    method: 'get',
    params: query
  })
}

export function getOperLogStat(query) {
  return request({
    url: '/operLog/stat',
    method: 'get',
    params: query
  })
}

export function getOperLogDateStat(query) {
  return request({
    url: '/operLog/dateStat',
    method: 'get',
    params: query
  })
}

export function getCompareData(query) {
  return request({
    url: '/operLog/compareData',
    method: 'get',
    params: query
  })
}

export function getNearestCompareData(query) {
  return request({
    url: '/operLog/nearestCompareData',
    method: 'get',
    params: query
  })
}

export function getEditLogData(query) {
  return request({
    url: '/operLog/editLogData',
    method: 'get',
    params: query
  })
}

export function getFlowList(query) {
  return request({
    url: '/operLog/flow',
    method: 'get',
    params: query
  })
}
