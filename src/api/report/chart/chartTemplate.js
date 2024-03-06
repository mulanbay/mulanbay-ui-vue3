import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/chartTemplate/list',
    method: 'get',
    params: query
  })
}

export function getChartTemplate(templateId) {
  return request({
    url: '/chartTemplate/get',
    method: 'get',
    params: { templateId }
  })
}

export function createChartTemplate(data) {
  return request({
    url: '/chartTemplate/create',
    method: 'post',
    data
  })
}

export function editChartTemplate(data) {
  return request({
    url: '/chartTemplate/edit',
    method: 'post',
    data
  })
}
export function deleteChartTemplate(ids) {
  const data = {
      ids
  }
  return request({
    url: '/chartTemplate/delete',
    method: 'post',
    data
  })
}

export function getChartTemplateTree() {
  return request({
    url: '/chartTemplate/tree',
    method: 'get'
  })
}

export function getChartTemplateUserTree() {
  return request({
    url: '/chartTemplate/userTree',
    method: 'get'
  })
}
