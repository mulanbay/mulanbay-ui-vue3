import request from '@/utils/request'

/**
 * 概要统计
 * @param {Object} query
 */
export function generalStat() {
  return request({
    url: '/main/generalStat',
    method: 'get'
  })
}

/**
 * 概要统计
 * @param {Object} query
 */
export function generalLifeStat(query) {
  return request({
    url: '/main/generalLifeStat',
    method: 'get',
    params: query
  })
}
