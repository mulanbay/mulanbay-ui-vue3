import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/bodyAbnormal/list',
    method: 'get',
    params: query
  })
}

export function getBodyAbnormal(id) {
  return request({
    url: '/bodyAbnormal/get',
    method: 'get',
    params: { id }
  })
}

export function createBodyAbnormal(data) {
  return request({
    url: '/bodyAbnormal/create',
    method: 'post',
    data
  })
}

export function editBodyAbnormal(data) {
  return request({
    url: '/bodyAbnormal/edit',
    method: 'post',
    data
  })
}
export function deleteBodyAbnormal(ids) {
  const data = {
      ids
  }
  return request({
    url: '/bodyAbnormal/delete',
    method: 'post',
    data
  })
}

export function getBodyAbnormalDateStat(query) {
  return request({
    url: '/bodyAbnormal/dateStat',
    method: 'get',
    params: query
  })
}

export function getBodyAbnormalStat(query) {
  return request({
    url: '/bodyAbnormal/stat',
    method: 'get',
    params: query
  })
}

export function getBodyAbnormalAnalyse(query) {
  return request({
    url: '/bodyAbnormal/analyse',
    method: 'get',
    params: query
  })
}

export function getAbnormalCateTree(groupField,needRoot) {
  return request({
    url: '/bodyAbnormal/tree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}
