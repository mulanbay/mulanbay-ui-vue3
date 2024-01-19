import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dbClean/list',
    method: 'get',
    params: query
  })
}

export function getDBClean(id) {
  return request({
    url: '/dbClean/get',
    method: 'get',
    params: { id }
  })
}

export function getTableCounts(id) {
  return request({
    url: '/dbClean/counts',
    method: 'get',
    params: { id }
  })
}

export function createDBClean(data) {
  return request({
    url: '/dbClean/create',
    method: 'post',
    data
  })
}

export function manualClean(data) {
  return request({
    url: '/dbClean/manualClean',
    method: 'post',
    data
  })
}


export function editDBClean(data) {
  return request({
    url: '/dbClean/edit',
    method: 'post',
    data
  })
}

export function deleteDBClean(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dbClean/delete',
    method: 'post',
    data
  })
}
