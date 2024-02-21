import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dream/list',
    method: 'get',
    params: query
  })
}

export function fetchDelayList(query) {
  return request({
    url: '/dream/delayList',
    method: 'get',
    params: query
  })
}


export function getDream(dreamId) {
  return request({
    url: '/dream/get',
    method: 'get',
    params: { dreamId }
  })
}


export function createDream(data) {
  return request({
    url: '/dream/create',
    method: 'post',
    data
  })
}

export function editDream(data) {
  return request({
    url: '/dream/edit',
    method: 'post',
    data
  })
}

export function deleteDream(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dream/delete',
    method: 'post',
    data
  })
}

export function refreshDreamRate() {
  return request({
    url: '/dream/refreshRate',
    method: 'get'
  })
}

export function getDreamStat(query) {
  return request({
    url: '/dream/stat',
    method: 'get',
    params: query
  })
}
