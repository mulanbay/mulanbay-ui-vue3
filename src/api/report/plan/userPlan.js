import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userPlan/list',
    method: 'get',
    params: query
  })
}

export function getUserPlan(planId) {
  return request({
    url: '/userPlan/get',
    method: 'get',
    params: { planId }
  })
}

export function createUserPlan(data) {
  return request({
    url: '/userPlan/create',
    method: 'post',
    data
  })
}

export function editUserPlan(data) {
  return request({
    url: '/userPlan/edit',
    method: 'post',
    data
  })
}

export function deleteUserPlan(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userPlan/delete',
    method: 'post',
    data
  })
}

export function getUserPlanTree(query) {
  return request({
    url: '/userPlan/tree',
    method: 'get',
    params: query
  })
}

export function getUserPlanStat(query) {
  return request({
    url: '/userPlan/stat',
    method: 'get',
    params: query
  })
}

export function getUserPlanStatList(query) {
  return request({
    url: '/userPlan/statList',
    method: 'get',
    params: query
  })
}

export function getBussIdentityKey(planId) {
  return request({
    url: '/userPlan/getBussIdentityKey',
    method: 'get',
    params: { planId }
  })
}