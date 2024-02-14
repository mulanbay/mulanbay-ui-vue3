import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sleep/list',
    method: 'get',
    params: query
  })
}

export function getSleep(sleepId) {
  return request({
    url: '/sleep/get',
    method: 'get',
    params: { sleepId }
  })
}

export function createSleep(data) {
  return request({
    url: '/sleep/create',
    method: 'post',
    data
  })
}

export function editSleep(data) {
  return request({
    url: '/sleep/edit',
    method: 'post',
    data
  })
}
export function deleteSleep(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sleep/delete',
    method: 'post',
    data
  })
}

export function getSleepAnalyseStat(query) {
  return request({
    url: '/sleep/analyseStat',
    method: 'get',
    params: query
  })
}
