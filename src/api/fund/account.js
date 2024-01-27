import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/account/list',
    method: 'get',
    params: query
  })
}

export function changeAccount(data) {
  return request({
    url: '/account/change',
    method: 'post',
    data
  })
}


export function getAccount(accountId) {
  return request({
    url: '/account/get',
    method: 'get',
    params: { accountId }
  })
}

export function getAccountTree(needRoot) {
  return request({
    url: '/account/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createAccount(data) {
  return request({
    url: '/account/create',
    method: 'post',
    data
  })
}

export function editAccount(data) {
  return request({
    url: '/account/edit',
    method: 'post',
    data
  })
}
export function deleteAccount(ids) {
  const data = {
      ids
  }
  return request({
    url: '/account/delete',
    method: 'post',
    data
  })
}

export function getAccountStat(query) {
  return request({
    url: '/account/stat',
    method: 'get',
    params:query
  })
}


export function createAccountSnapshot(data) {
  return request({
    url: '/account/createSnapshot',
    method: 'post',
    data
  })
}

export function updateBudgetLogAccountChange(bussKey) {
  const data = {
      bussKey
  }
  return request({
    url: '/account/updateBudgetLogAccountChange',
    method: 'post',
    data
  })
}
