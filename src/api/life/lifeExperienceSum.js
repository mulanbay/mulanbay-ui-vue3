import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeExperienceSum/getData',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceSum(id) {
  return request({
    url: '/lifeExperienceSum/get',
    method: 'get',
    params: { id }
  })
}

export function createLifeExperienceSum(data) {
  return request({
    url: '/lifeExperienceSum/create',
    method: 'post',
    data
  })
}

export function updateLifeExperienceSum(data) {
  return request({
    url: '/lifeExperienceSum/edit',
    method: 'post',
    data
  })
}
export function deleteLifeExperienceSum(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeExperienceSum/delete',
    method: 'post',
    data
  })
}

export function reviseLifeExperienceSum(id) {
  const data = {
      id
  }
  return request({
    url: '/lifeExperienceSum/revise',
    method: 'post',
    data
  })
}

export function analyseLifeExperienceSum(query) {
  return request({
    url: '/lifeExperienceSum/analyse',
    method: 'get',
    params: query
  })
}
