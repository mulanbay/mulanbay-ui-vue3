import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/scoreConfig/list',
    method: 'get',
    params: query
  })
}

export function getScoreConfig(configId) {
  return request({
    url: '/scoreConfig/get',
    method: 'get',
    params: { configId }
  })
}

export function createScoreConfig(data) {
  return request({
    url: '/scoreConfig/create',
    method: 'post',
    data
  })
}

export function editScoreConfig(data) {
  return request({
    url: '/scoreConfig/edit',
    method: 'post',
    data
  })
}
export function deleteScoreConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/scoreConfig/delete',
    method: 'post',
    data
  })
}
