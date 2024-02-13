import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/bodyInfo/list',
    method: 'get',
    params: query
  })
}

export function getBodyInfo(id) {
  return request({
    url: '/bodyInfo/get',
    method: 'get',
    params: { id }
  })
}

export function createBodyInfo(data) {
  return request({
    url: '/bodyInfo/create',
    method: 'post',
    data
  })
}

export function editBodyInfo(data) {
  return request({
    url: '/bodyInfo/edit',
    method: 'post',
    data
  })
}
export function deleteBodyInfo(ids) {
  const data = {
      ids
  }
  return request({
    url: '/bodyInfo/delete',
    method: 'post',
    data
  })
}

export function getBodyInfoDateStat(query) {
  return request({
    url: '/bodyInfo/dateStat',
    method: 'get',
    params: query
  })
}

export function getBodyInfoYoyStat(query) {
  return request({
    url: '/bodyInfo/yoyStat',
    method: 'get',
    params: query
  })
}
