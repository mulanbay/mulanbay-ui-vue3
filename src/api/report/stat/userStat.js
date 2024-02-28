import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userStat/list',
    method: 'get',
    params: query
  })
}

export function getUserStat(statId) {
  return request({
    url: '/userStat/get',
    method: 'get',
    params: { statId }
  })
}

export function createUserStat(data) {
  return request({
    url: '/userStat/create',
    method: 'post',
    data
  })
}

export function editUserStat(data) {
  return request({
    url: '/userStat/edit',
    method: 'post',
    data
  })
}
export function deleteUserStat(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userStat/delete',
    method: 'post',
    data
  })
}

export function getUserStatTree(bussType) {
  return request({
    url: '/userStat/tree',
    method: 'get',
    params: {
      bussType:bussType
    }
  })
}

export function getUserStatStat(query) {
  return request({
    url: '/userStat/stat',
    method: 'get',
    params: query
  })
}

export function getUserStatStatList(query) {
  return request({
    url: '/userStat/statList',
    method: 'get',
    params: query
  })
}

export function deleteStatCache(data) {
  return request({
    url: '/userStat/deleteStatCache',
    method: 'post',
    data
  })
}