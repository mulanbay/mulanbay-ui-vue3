import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/experienceDetail/list',
    method: 'get',
    params: query
  })
}

export function getExperienceDetail(detailId) {
  return request({
    url: '/experienceDetail/get',
    method: 'get',
    params: { detailId }
  })
}

export function getLastExperienceDetail(expId) {
  return request({
    url: '/experienceDetail/lastDetail',
    method: 'get',
    params: { expId }
  })
}

export function createExperienceDetail(data) {
  return request({
    url: '/experienceDetail/create',
    method: 'post',
    data
  })
}

export function editExperienceDetail(data) {
  return request({
    url: '/experienceDetail/edit',
    method: 'post',
    data
  })
}
export function deleteExperienceDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/experienceDetail/delete',
    method: 'post',
    data
  })
}

export function getExperienceDetailTree(query) {
  return request({
    url: '/experienceDetail/tree',
    method: 'get',
    params: query
  })
}
