import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/planTemplate/list',
    method: 'get',
    params: query
  })
}

export function getNextOrderIndex(bussType) {
  return request({
    url: '/planTemplate/nextOrderIndex',
    method: 'get',
    params: { bussType }
  })
}

export function getPlanTemplate(templateId) {
  return request({
    url: '/planTemplate/get',
    method: 'get',
    params: { templateId }
  })
}

export function createPlanTemplate(data) {
  return request({
    url: '/planTemplate/create',
    method: 'post',
    data
  })
}

export function editPlanTemplate(data) {
  return request({
    url: '/planTemplate/edit',
    method: 'post',
    data
  })
}
export function deletePlanTemplate(ids) {
  const data = {
      ids
  }
  return request({
    url: '/planTemplate/delete',
    method: 'post',
    data
  })
}

export function getPlanTemplateTree() {
  return request({
    url: '/planTemplate/tree',
    method: 'get'
  })
}

export function getPlanTemplateUserTree() {
  return request({
    url: '/planTemplate/userTree',
    method: 'get'
  })
}
