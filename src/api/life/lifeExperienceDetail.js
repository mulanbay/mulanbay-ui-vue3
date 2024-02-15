import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeExperienceDetail/getData',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceDetail(id) {
  return request({
    url: '/lifeExperienceDetail/get',
    method: 'get',
    params: { id }
  })
}

export function createLifeExperienceDetail(data) {
  return request({
    url: '/lifeExperienceDetail/create',
    method: 'post',
    data
  })
}

export function updateLifeExperienceDetail(data) {
  return request({
    url: '/lifeExperienceDetail/edit',
    method: 'post',
    data
  })
}
export function deleteLifeExperienceDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeExperienceDetail/delete',
    method: 'post',
    data
  })
}

export function getCountryLocation(country) {
  return request({
    url: '/lifeExperienceDetail/getCountryLocation',
    method: 'get',
    params: { country }
  })
}

export function getCityLocation(city) {
  return request({
    url: '/lifeExperienceDetail/getCityLocation',
    method: 'get',
    params: { city }
  })
}
