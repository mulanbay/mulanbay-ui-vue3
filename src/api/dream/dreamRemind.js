import request from '@/utils/request'

export function getRemindByDream(dreamId) {
  return request({
    url: '/dreamRemind/getByDream',
    method: 'get',
    params: { dreamId }
  })
}


export function createDreamRemind(data) {
  return request({
    url: '/dreamRemind/create',
    method: 'post',
    data
  })
}

export function editDreamRemind(data) {
  return request({
    url: '/dreamRemind/edit',
    method: 'post',
    data
  })
}
