import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/behaviorTemplate/list',
    method: 'get',
    params: query
  })
}

export function getBehaviorTemplate(templateId) {
  return request({
    url: '/behaviorTemplate/get',
    method: 'get',
    params: { templateId }
  })
}

export function createBehaviorTemplate(data) {
  return request({
    url: '/behaviorTemplate/create',
    method: 'post',
    data
  })
}

export function editBehaviorTemplate(data) {
  return request({
    url: '/behaviorTemplate/edit',
    method: 'post',
    data
  })
}
export function deleteBehaviorTemplate(ids) {
  const data = {
      ids
  }
  return request({
    url: '/behaviorTemplate/delete',
    method: 'post',
    data
  })
}

export function getBehaviorTemplateTree() {
  return request({
    url: '/behaviorTemplate/tree',
    method: 'get'
  })
}

export function getBehaviorTemplateUserTree() {
  return request({
    url: '/behaviorTemplate/userTree',
    method: 'get'
  })
}
