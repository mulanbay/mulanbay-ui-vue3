import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/bookCategory/list',
    method: 'get',
    params: query
  })
}

export function getBookCategory(cateId) {
  return request({
    url: '/bookCategory/get',
    method: 'get',
    params: { cateId }
  })
}

export function getBookCategoryTree(needRoot) {
  return request({
    url: '/bookCategory/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createBookCategory(data) {
  return request({
    url: '/bookCategory/create',
    method: 'post',
    data
  })
}

export function editBookCategory(data) {
  return request({
    url: '/bookCategory/edit',
    method: 'post',
    data
  })
}
export function deleteBookCategory(ids) {
  const data = {
      ids
  }
  return request({
    url: '/bookCategory/delete',
    method: 'post',
    data
  })
}
