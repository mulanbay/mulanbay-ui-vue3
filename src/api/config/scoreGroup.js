import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/scoreGroup/list',
    method: 'get',
    params: query
  })
}

export function getScoreGroup(id) {
  return request({
    url: '/scoreGroup/get',
    method: 'get',
    params: { id }
  })
}

export function createScoreGroup(data) {
  return request({
    url: '/scoreGroup/create',
    method: 'post',
    data
  })
}

export function copyScoreGroup(data) {
  return request({
    url: '/scoreGroup/copy',
    method: 'post',
    data
  })
}

export function editScoreGroup(data) {
  return request({
    url: '/scoreGroup/edit',
    method: 'post',
    data
  })
}
export function deleteScoreGroup(ids) {
  const data = {
      ids
  }
  return request({
    url: '/scoreGroup/delete',
    method: 'post',
    data
  })
}


export function getScoreGroupTree() {
  return request({
    url: '/scoreGroup/tree',
    method: 'get'
  })
}
