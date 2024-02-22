import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/foodCategory/list',
    method: 'get',
    params: query
  })
}

export function getFoodCategory(cateId) {
  return request({
    url: '/foodCategory/get',
    method: 'get',
    params: { cateId }
  })
}

export function createFoodCategory(data) {
  return request({
    url: '/foodCategory/create',
    method: 'post',
    data
  })
}

export function editFoodCategory(data) {
  return request({
    url: '/foodCategory/edit',
    method: 'post',
    data
  })
}

export function deleteFoodCategory(ids) {
  const data = {
      ids
  }
  return request({
    url: '/foodCategory/delete',
    method: 'post',
    data
  })
}
