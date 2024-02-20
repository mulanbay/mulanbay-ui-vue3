import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/readDetail/list',
    method: 'get',
    params: query
  })
}

export function getReadDetail(detailId) {
  return request({
    url: '/readDetail/get',
    method: 'get',
    params: { detailId }
  })
}

export function createReadDetail(data) {
  return request({
    url: '/readDetail/create',
    method: 'post',
    data
  })
}

export function editReadDetail(data) {
  return request({
    url: '/readDetail/edit',
    method: 'post',
    data
  })
}
export function deleteReadDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/readDetail/delete',
    method: 'post',
    data
  })
}

export function getReadDetailDateStat(query) {
  return request({
    url: '/readDetail/dateStat',
    method: 'get',
    params: query
  })
}
