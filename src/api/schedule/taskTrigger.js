import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/taskTrigger/list',
    method: 'get',
    params: query
  })
}

export function getTaskTrigger(triggerId) {
  return request({
    url: '/taskTrigger/get',
    method: 'get',
    params: { triggerId }
  })
}

export function getScheduleDetail(triggerId) {
  return request({
    url: '/taskTrigger/scheduleDetail',
    method: 'get',
    params: { triggerId }
  })
}

export function createTaskTrigger(data) {
  return request({
    url: '/taskTrigger/create',
    method: 'post',
    data
  })
}

export function editTaskTrigger(data) {
  return request({
    url: '/taskTrigger/edit',
    method: 'post',
    data
  })
}

export function deleteTaskTrigger(ids) {
  const data = {
      ids
  }
  return request({
    url: '/taskTrigger/delete',
    method: 'post',
    data
  })
}

export function resetTaskTrigger(data) {
  return request({
    url: '/taskTrigger/reset',
    method: 'post',
    data
  })
}

export function editTaskTriggerStatus(data) {
  return request({
    url: '/taskTrigger/editStatus',
    method: 'post',
    data
  })
}

export function changeScheduleStatus(afterStatus) {
  const data = {
	afterStatus: afterStatus
  }
  return request({
    url: '/taskTrigger/changeScheduleStatus',
    method: 'post',
    data
  })
}

export function getTaskTriggerTree(needRoot) {
  return request({
    url: '/taskTrigger/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getTaskTriggerCategoryTree(groupField,needRoot) {
  return request({
    url: '/taskTrigger/categoryTree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getParaDefine(className) {
  return request({
    url: '/taskTrigger/paraDefine',
    method: 'get',
    params: {
      className:className
    }
  })
}

export function getScheduleInfo() {
  return request({
    url: '/taskTrigger/scheduleInfo',
    method: 'get'
  })
}

export function manualStart(data) {
  return request({
    url: '/taskTrigger/manualStart',
    method: 'post',
    data
  })
}

export function refreshSchedule(data) {
  return request({
    url: '/taskTrigger/refreshSchedule',
    method: 'post',
    data
  })
}

export function recentSchedules() {
  return request({
    url: '/taskTrigger/recentSchedules',
    method: 'get'
  })
}
