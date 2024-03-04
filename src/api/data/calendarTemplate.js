import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/calendarTemplate/list',
    method: 'get',
    params: query
  })
}

export function getNextOrderIndex(bussType) {
  return request({
    url: '/calendarTemplate/nextOrderIndex',
    method: 'get',
    params: { bussType }
  })
}

export function getCalendarTemplate(templateId) {
  return request({
    url: '/calendarTemplate/get',
    method: 'get',
    params: { templateId }
  })
}

export function createCalendarTemplate(data) {
  return request({
    url: '/calendarTemplate/create',
    method: 'post',
    data
  })
}

export function editCalendarTemplate(data) {
  return request({
    url: '/calendarTemplate/edit',
    method: 'post',
    data
  })
}
export function deleteCalendarTemplate(ids) {
  const data = {
      ids
  }
  return request({
    url: '/calendarTemplate/delete',
    method: 'post',
    data
  })
}

export function getCalendarTemplateTree() {
  return request({
    url: '/calendarTemplate/tree',
    method: 'get'
  })
}

export function getCalendarTemplateUserTree() {
  return request({
    url: '/calendarTemplate/userTree',
    method: 'get'
  })
}
