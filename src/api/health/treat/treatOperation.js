import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatOperation/getData',
    method: 'get',
    params: query
  })
}


export function getTreatOperation(id) {
  return request({
    url: '/treatOperation/get',
    method: 'get',
    params: { id }
  })
}

export function createTreatOperation(data) {
  return request({
    url: '/treatOperation/create',
    method: 'post',
    data
  })
}

export function updateTreatOperation(data) {
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

export function getTreatOperationCategoryTree(groupField,needRoot) {
  return request({
    url: '/treatOperation/getTreatOperationCategoryTree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getTreatOperationStat(query) {
  return request({
    url: '/treatOperation/stat',
    method: 'get',
    params: query
  })
}
