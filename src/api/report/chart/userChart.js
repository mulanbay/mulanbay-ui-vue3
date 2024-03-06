import request from '@/utils/request'

export function getUserChartStat(url,para) {
  return request({
    url: url,
    method: 'get',
    params: para
  })
}
