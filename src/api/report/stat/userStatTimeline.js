import request from '@/utils/request'

export function getUserStatTimelineValueStat(query) {
  return request({
    url: '/userStatTimeline/valueStat',
    method: 'get',
    params: query
  })
}

export function getUserStatTimelineNameValueStat(query) {
  return request({
    url: '/userStatTimeline/nameValueStat',
    method: 'get',
    params: query
  })
}