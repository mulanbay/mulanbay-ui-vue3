import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/experienceConsume/list',
    method: 'get',
    params: query
  })
}

export function getExperienceConsume(consumeId) {
  return request({
    url: '/experienceConsume/get',
    method: 'get',
    params: { consumeId }
  })
}

export function createExperienceConsume(data) {
  return request({
    url: '/experienceConsume/create',
    method: 'post',
    data
  })
}

export function editExperienceConsume(data) {
  return request({
    url: '/experienceConsume/edit',
    method: 'post',
    data
  })
}
export function deleteExperienceConsume(ids) {
  const data = {
      ids
  }
  return request({
    url: '/experienceConsume/delete',
    method: 'post',
    data
  })
}
