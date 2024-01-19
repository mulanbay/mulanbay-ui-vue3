import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/taskLog/list',
    method: 'get',
    params: query
  })
}

export function getTaskLog(logId) {
  return request({
    url: '/taskLog/get',
    method: 'get',
    params: { logId }
  })
}

export function getLastTaskLog(triggerId) {
  return request({
    url: '/taskLog/lastTaskLog',
    method: 'get',
    params: { triggerId }
  })
}

export function redoTaskLog(logId) {
  return request({
    url: '/taskLog/redo',
    method: 'get',
    params: { logId }
  })
}

export function getTaskLogCostTimeStat(query) {
  return request({
    url: '/taskLog/costTimeStat',
    method: 'get',
    params: query
  })
}

