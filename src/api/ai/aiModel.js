import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/aiModel/list',
    method: 'get',
    params: query
  })
}

export function getAIModel(modelId) {
  return request({
    url: '/aiModel/get',
    method: 'get',
    params: { modelId }
  })
}

export function getProcessorTree() {
  return request({
    url: '/aiModel/processorTree',
    method: 'get'
  })
}


export function createAIModel(data) {
  return request({
    url: '/aiModel/create',
    method: 'post',
    data
  })
}

export function editAIModel(data) {
  return request({
    url: '/aiModel/edit',
    method: 'post',
    data
  })
}

export function deleteAIModel(ids) {
  const data = {
      ids
  }
  return request({
    url: '/aiModel/delete',
    method: 'post',
    data
  })
}

export function publishAIModel(data) {
  return request({
    url: '/aiModel/publish',
    method: 'post',
    data
  })
}

export function refreshAIModel(data) {
  return request({
    url: '/aiModel/refresh',
    method: 'post',
    data
  })
}

export function revokeAIModel(data) {
  return request({
    url: '/aiModel/revoke',
    method: 'post',
    data
  })
}
