import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/budget/list',
    method: 'get',
    params: query
  })
}

export function changeBudgetStatus(id,status) {
  const data = {
      id,
      status
  }
  return request({
    url: '/budget/changeStatus',
    method: 'post',
    params: data
  })
}

export function getBudget(budgetId) {
  return request({
    url: '/budget/get',
    method: 'get',
    params: { budgetId }
  })
}

export function createBudget(data) {
  return request({
    url: '/budget/create',
    method: 'post',
    data
  })
}

export function editBudget(data) {
  return request({
    url: '/budget/edit',
    method: 'post',
    data
  })
}

export function deleteBudget(ids) {
  const data = {
      ids
  }
  return request({
    url: '/budget/delete',
    method: 'post',
    data
  })
}

export function getBudgetTree(needRoot,filterEmpty) {
  return request({
    url: '/budget/tree',
    method: 'get',
    params: { needRoot,filterEmpty }
  })
}

export function getBudgetStat(query) {
  return request({
    url: '/budget/stat',
    method: 'get',
    params: query
  })
}
