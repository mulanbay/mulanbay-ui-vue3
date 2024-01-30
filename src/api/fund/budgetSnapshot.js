import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/budgetSnapshot/list',
    method: 'get',
    params: query
  })
}

export function getDetailList(query) {
  return request({
    url: '/budgetSnapshot/detailList',
    method: 'get',
    params: query
  })
}

export function history(query) {
  return request({
    url: '/budgetSnapshot/history',
    method: 'get',
    params: query
  })
}

export function getChildren(query) {
  return request({
    url: '/budgetSnapshot/getChildren',
    method: 'get',
    params: query
  })
}

export function buyRecord(query) {
  return request({
    url: '/budgetSnapshot/buyRecord',
    method: 'get',
    params: query
  })
}

export function treatRecord(query) {
  return request({
    url: '/budgetSnapshot/treatRecord',
    method: 'get',
    params: query
  })
}
