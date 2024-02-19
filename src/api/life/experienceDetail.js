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

export function getCountryLocation(countryId) {
  return request({
    url: '/experienceDetail/getCountryLocation',
    method: 'get',
    params: { countryId }
  })
}

export function getCityLocation(city) {
  return request({
    url: '/experienceDetail/getCityLocation',
    method: 'get',
    params: { city }
  })
}
