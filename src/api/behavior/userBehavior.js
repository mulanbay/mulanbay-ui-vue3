import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userBehavior/list',
    method: 'get',
    params: query
  })
}

export function getCalendarList(query) {
  return request({
    url: '/userBehavior/calendarList',
    method: 'get',
    params: query
  })
}

export function getSourceDetail(sourceId,bussType) {
  return request({
    url: '/userBehavior/sourceDetail',
    method: 'get',
    params: { 
      sourceId:sourceId,
      bussType,bussType
    }
  })
}

export function getUserBehaviorWordCloudStat(query) {
  return request({
    url: '/userBehavior/wordCloudStat',
    method: 'get',
    params: query
  })
}