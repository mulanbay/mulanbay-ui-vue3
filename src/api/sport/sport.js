import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sport/list',
    method: 'get',
    params: query
  })
}


export function getSport(sportId) {
  return request({
    url: '/sport/get',
    method: 'get',
    params: { sportId }
  })
}

export function getSportTree(needRoot) {
  return request({
    url: '/sport/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createSport(data) {
  return request({
    url: '/sport/create',
    method: 'post',
    data
  })
}

export function editSport(data) {
  return request({
    url: '/sport/edit',
    method: 'post',
    data
  })
}
export function deleteSport(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sport/delete',
    method: 'post',
    data
  })
}
