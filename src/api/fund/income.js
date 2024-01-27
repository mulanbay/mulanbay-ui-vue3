import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/income/list',
    method: 'get',
    params: query
  })
}

export function getIncome(incomeId) {
  return request({
    url: '/income/get',
    method: 'get',
    params: { incomeId }
  })
}

export function getConsumeRefer(incomeId) {
  return request({
    url: '/income/getConsume',
    method: 'get',
    params: { incomeId }
  })
}

export function createIncome(data) {
  return request({
    url: '/income/create',
    method: 'post',
    data
  })
}

export function editIncome(data) {
  return request({
    url: '/income/edit',
    method: 'post',
    data
  })
}
export function deleteIncome(ids) {
  const data = {
      ids
  }
  return request({
    url: '/income/delete',
    method: 'post',
    data
  })
}

export function getIncomeStat(query) {
  return request({
    url: '/income/stat',
    method: 'get',
    params:query
  })
}

export function getIncomeDateStat(query) {
  return request({
    url: '/income/dateStat',
    method: 'get',
    params:query
  })
}

