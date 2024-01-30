import request from '@/utils/request'

export function getBudgetTimelineStat(query) {
  return request({
    url: '/budgetTimeline/stat',
    method: 'get',
    params: query
  })
}

export function reStatBudgetTimeline(data) {
  return request({
    url: '/budgetTimeline/reStat',
    method: 'post',
    data
  })
}
