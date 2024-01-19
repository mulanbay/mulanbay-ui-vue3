import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dictGroup/list',
    method: 'get',
    params: query
  })
}

export function getDictGroup(groupId) {
  return request({
    url: '/dictGroup/get',
    method: 'get',
    params: { groupId }
  })
}

export function createDictGroup(data) {
  return request({
    url: '/dictGroup/create',
    method: 'post',
    data
  })
}

export function editDictGroup(data) {
  return request({
    url: '/dictGroup/edit',
    method: 'post',
    data
  })
}

export function copyDictGroup(data) {
  return request({
    url: '/dictGroup/copy',
    method: 'post',
    data
  })
}

export function deleteDictGroup(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dictGroup/delete',
    method: 'post',
    data
  })
}


export function getDictGroupTree(idField,needRoot) {
  return request({
    url: '/dictGroup/tree',
    method: 'get',
    params: {
      idField:idField,
      needRoot:needRoot
    }
  })
}
