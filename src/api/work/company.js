import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/company/list',
    method: 'get',
    params: query
  })
}

export function getCompany(companyId) {
  return request({
    url: '/company/get',
    method: 'get',
    params: { companyId }
  })
}

export function getCompanyTree(needRoot) {
  return request({
    url: '/company/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createCompany(data) {
  return request({
    url: '/company/create',
    method: 'post',
    data
  })
}

export function editCompany(data) {
  return request({
    url: '/company/edit',
    method: 'post',
    data
  })
}

export function deleteCompany(ids) {
  const data = {
      ids
  }
  return request({
    url: '/company/delete',
    method: 'post',
    data
  })
}
