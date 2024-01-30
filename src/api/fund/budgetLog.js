import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/budgetLog/list',
    method: 'get',
    params: query
  })
}

export function getBudgetLog(logId) {
  return request({
    url: '/budgetLog/get',
    method: 'get',
    params: { logId }
  })
}

export function createBudgetLog(data) {
  return request({
    url: '/budgetLog/create',
    method: 'post',
    data
  })
}

export function editBudgetLog(data) {
  return request({
    url: '/budgetLog/edit',
    method: 'post',
    data
  })
}

export function deleteBudgetLog(ids) {
  const data = {
      ids
  }
  return request({
    url: '/budgetLog/delete',
    method: 'post',
    data
  })
}

export function getBudgetLogStat(query) {
  return request({
    url: '/budgetLog/stat',
    method: 'get',
    params: query
  })
}

export function getBudgetLogBiasStat(query) {
  return request({
    url: '/budgetLog/biasStat',
    method: 'get',
    params: query
  })
}

export function getBudgetLogPeriodStat(query) {
  return request({
    url: '/budgetLog/periodStat',
    method: 'get',
    params: query
  })
}

export function reSaveBudgetLog(logId) {
  const data = {
      logId
  }
  return request({
    url: '/budgetLog/reSave',
    method: 'post',
    data
  })
}