import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/role/list',
    method: 'get',
    params: query
  })
}


export function getRole(roleId) {
  return request({
    url: '/role/get',
    method: 'get',
    params: { roleId }
  })
}

export function getRoleTree() {
  return request({
    url: '/role/tree',
    method: 'get'
  })
}

export function getRoleFunctionTree(roleId,separate,needRoot) {
  return request({
    url: '/role/roleFunctionTree',
    method: 'get',
    params: {
      roleId:roleId,
      separate:separate,
      needRoot:needRoot
    }
  })
}

export function refreshCache() {
  return request({
    url: '/role/refreshCache',
    method: 'post'
  })
}

export function saveRoleFunction(data) {
  return request({
    url: '/role/saveRoleFunction',
    method: 'post',
    data
  })
}


export function createRole(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data
  })
}

export function editRole(data) {
  return request({
    url: '/role/edit',
    method: 'post',
    data
  })
}
export function deleteRole(ids) {
  const data = {
      ids
  }
  return request({
    url: '/role/delete',
    method: 'post',
    data
  })
}
