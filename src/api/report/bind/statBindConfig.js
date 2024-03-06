import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/statBindConfig/list',
    method: 'get',
    params: query
  })
}

export function getStatBindConfigTree(fid,type)  {
  return request({
    url: '/statBindConfig/tree',
    method: 'get',
    params: { 
      fid:fid,
      type:type
    }
  })
}

export function getStatBindConfig(configId) {
  return request({
    url: '/statBindConfig/get',
    method: 'get',
    params: { configId }
  })
}

export function createStatBindConfig(data) {
  return request({
    url: '/statBindConfig/create',
    method: 'post',
    data
  })
}

export function editStatBindConfig(data) {
  return request({
    url: '/statBindConfig/edit',
    method: 'post',
    data
  })
}
export function deleteStatBindConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/statBindConfig/delete',
    method: 'post',
    data
  })
}

export function parseStatBindConfigs(fid,type) {
  return request({
    url: '/statBindConfig/parseConfigs',
    method: 'get',
    params: { 
      fid:fid,
      type:type
    }
  })
}