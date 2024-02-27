import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/statTemplate/list',
    method: 'get',
    params: query
  })
}

export function getStatTemplate(templateId) {
  return request({
    url: '/statTemplate/get',
    method: 'get',
    params: { templateId }
  })
}

export function createStatTemplate(data) {
  return request({
    url: '/statTemplate/create',
    method: 'post',
    data
  })
}

export function editStatTemplate(data) {
  return request({
    url: '/statTemplate/edit',
    method: 'post',
    data
  })
}
export function deleteStatTemplate(ids) {
  const data = {
      ids
  }
  return request({
    url: '/statTemplate/delete',
    method: 'post',
    data
  })
}

export function getStatTemplateTree() {
  return request({
    url: '/statTemplate/tree',
    method: 'get'
  })
}

export function getStatTemplateUserTree() {
  return request({
    url: '/statTemplate/userTree',
    method: 'get'
  })
}
