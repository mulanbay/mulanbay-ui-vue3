import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sysCode/list',
    method: 'get',
    params: query
  })
}

export function getSysCode(code) {
  return request({
    url: '/sysCode/get',
    method: 'get',
    params: { code }
  })
}


export function createSysCode(data) {
  return request({
    url: '/sysCode/create',
    method: 'post',
    data
  })
}

export function editSysCode(data) {
  return request({
    url: '/sysCode/edit',
    method: 'post',
    data
  })
}
export function deleteSysCode(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sysCode/delete',
    method: 'post',
    data
  })
}

export function refreshCache(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sysCode/refreshCache',
    method: 'post',
    data
  })
}
