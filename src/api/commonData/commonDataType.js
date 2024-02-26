import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/commonDataType/list',
    method: 'get',
    params: query
  })
}

export function getCommonDataType(typeId) {
  return request({
    url: '/commonDataType/get',
    method: 'get',
    params: { typeId }
  })
}

export function getCommonDataTypeTree(needRoot) {
  return request({
    url: '/commonDataType/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getGroupNameTree(needRoot) {
  return request({
    url: '/commonDataType/groupNameTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createCommonDataType(data) {
  return request({
    url: '/commonDataType/create',
    method: 'post',
    data
  })
}

export function editCommonDataType(data) {
  return request({
    url: '/commonDataType/edit',
    method: 'post',
    data
  })
}
export function deleteCommonDataType(ids) {
  const data = {
      ids
  }
  return request({
    url: '/commonDataType/delete',
    method: 'post',
    data
  })
}
