import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatOperation/list',
    method: 'get',
    params: query
  })
}


export function getTreatOperation(operationId) {
  return request({
    url: '/treatOperation/get',
    method: 'get',
    params: { operationId }
  })
}

export function createTreatOperation(data) {
  return request({
    url: '/treatOperation/create',
    method: 'post',
    data
  })
}

export function editTreatOperation(data) {
  return request({
    url: '/treatOperation/edit',
    method: 'post',
    data
  })
}
export function deleteTreatOperation(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treatOperation/delete',
    method: 'post',
    data
  })
}

export function getTreatOperationCateTree(query) {
  return request({
    url: '/treatOperation/tree',
    method: 'get',
    params: query
  })
}

export function getTreatOperationStat(query) {
  return request({
    url: '/treatOperation/stat',
    method: 'get',
    params: query
  })
}
