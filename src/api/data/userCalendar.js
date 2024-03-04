import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userCalendar/list',
    method: 'get',
    params: query
  })
}

export function getCalendarList(query) {
  return request({
    url: '/userCalendar/calendarList',
    method: 'get',
    params: query
  })
}

export function getCalendarFlowLogList(query) {
  return request({
    url: '/userCalendar/flowLogList',
    method: 'get',
    params: query
  })
}

export function getUserCalendar(calendarId) {
  return request({
    url: '/userCalendar/get',
    method: 'get',
    params: { calendarId }
  })
}

export function getUserCalendarBySource(sourceType,sourceId) {
  return request({
    url: '/userCalendar/getBySource',
    method: 'get',
    params: { sourceType,sourceId }
  })
}

export function getUserCalendarSourceDetail(calendarId) {
  return request({
    url: '/userCalendar/sourceDetail',
    method: 'get',
    params: { calendarId }
  })
}

export function createUserCalendar(data) {
  return request({
    url: '/userCalendar/create',
    method: 'post',
    data
  })
}

export function editUserCalendar(data) {
  return request({
    url: '/userCalendar/edit',
    method: 'post',
    data
  })
}

export function updateUserCalendarDate(data) {
  return request({
    url: '/userCalendar/updateDate',
    method: 'post',
    data
  })
}

export function deleteUserCalendar(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userCalendar/delete',
    method: 'post',
    data
  })
}

export function finishUserCalendar(data) {
  return request({
    url: '/userCalendar/finish',
    method: 'post',
    data
  })
}

export function reOpenUserCalendar(calendarId) {
  const data = {
      calendarId
  }
  return request({
    url: '/userCalendar/reOpen',
    method: 'post',
    data
  })
}