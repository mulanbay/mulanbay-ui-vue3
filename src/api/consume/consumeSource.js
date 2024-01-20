import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/consumeSource/list',
    method: 'get',
    params: query
  })
}

export function getConsumeSource(sourceId) {
  return request({
    url: '/consumeSource/get',
    method: 'get',
    params: { sourceId }
  })
}

export function createConsumeSource(data) {
  return request({
    url: '/consumeSource/create',
    method: 'post',
    data
  })
}

export function editConsumeSource(data) {
  return request({
    url: '/consumeSource/edit',
    method: 'post',
    data
  })
}

export function deleteConsumeSource(ids) {
  const data = {
      ids
  }
  return request({
    url: '/consumeSource/delete',
    method: 'post',
    data
  })
}


export function getConsumeSourceTree(needRoot) {
  return request({
    url: '/consumeSource/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}
