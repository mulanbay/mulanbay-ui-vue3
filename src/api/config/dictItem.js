import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dictItem/list',
    method: 'get',
    params: query
  })
}

export function getDictItem(itemId) {
  return request({
    url: '/dictItem/get',
    method: 'get',
    params: { itemId }
  })
}

export function createDictItem(data) {
  return request({
    url: '/dictItem/create',
    method: 'post',
    data
  })
}

export function editDictItem(data) {
  return request({
    url: '/dictItem/edit',
    method: 'post',
    data
  })
}
export function deleteDictItem(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dictItem/delete',
    method: 'post',
    data
  })
}
