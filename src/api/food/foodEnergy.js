import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/foodEnergy/list',
    method: 'get',
    params: query
  })
}

export function getFoodEnergy(foodId) {
  return request({
    url: '/foodEnergy/get',
    method: 'get',
    params: { foodId }
  })
}

export function createFoodEnergy(data) {
  return request({
    url: '/foodEnergy/create',
    method: 'post',
    data
  })
}

export function editFoodEnergy(data) {
  return request({
    url: '/foodEnergy/edit',
    method: 'post',
    data
  })
}

export function deleteFoodEnergy(ids) {
  const data = {
      ids
  }
  return request({
    url: '/foodEnergy/delete',
    method: 'post',
    data
  })
}
