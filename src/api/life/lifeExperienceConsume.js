import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeExperienceConsume/getData',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceConsume(id) {
  return request({
    url: '/lifeExperienceConsume/get',
    method: 'get',
    params: { id }
  })
}

export function createLifeExperienceConsume(data) {
  return request({
    url: '/lifeExperienceConsume/create',
    method: 'post',
    data
  })
}

export function updateLifeExperienceConsume(data) {
  return request({
    url: '/lifeExperienceConsume/edit',
    method: 'post',
    data
  })
}
export function deleteLifeExperienceConsume(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeExperienceConsume/delete',
    method: 'post',
    data
  })
}

export function getBuyRecordTree(query) {
  return request({
    url: '/lifeExperienceConsume/getBuyRecordTree',
    method: 'get',
    params: query
  })
}