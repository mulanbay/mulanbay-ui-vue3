import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/experienceSum/list',
    method: 'get',
    params: query
  })
}

export function getExperienceSum(sumId) {
  return request({
    url: '/experienceSum/get',
    method: 'get',
    params: { sumId }
  })
}

export function createExperienceSum(data) {
  return request({
    url: '/experienceSum/create',
    method: 'post',
    data
  })
}

export function editExperienceSum(data) {
  return request({
    url: '/experienceSum/edit',
    method: 'post',
    data
  })
}
export function deleteExperienceSum(ids) {
  const data = {
      ids
  }
  return request({
    url: '/experienceSum/delete',
    method: 'post',
    data
  })
}

export function reviseExperienceSum(sumId) {
  const data = {
    sumId 
  }
  return request({
    url: '/experienceSum/revise',
    method: 'post',
    data
  })
}

export function analyseExperienceSum(query) {
  return request({
    url: '/experienceSum/analyse',
    method: 'get',
    params: query
  })
}
