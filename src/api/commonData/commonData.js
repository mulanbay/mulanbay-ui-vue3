import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/commonData/list',
    method: 'get',
    params: query
  })
}

export function getCommonData(dataId) {
  return request({
    url: '/commonData/get',
    method: 'get',
    params: { dataId }
  })
}

export function createCommonData(data) {
  return request({
    url: '/commonData/create',
    method: 'post',
    data
  })
}

export function editCommonData(data) {
  return request({
    url: '/commonData/edit',
    method: 'post',
    data
  })
}
export function deleteCommonData(ids) {
  const data = {
      ids
  }
  return request({
    url: '/commonData/delete',
    method: 'post',
    data
  })
}

export function getCommonDataDateStat(query) {
  return request({
    url: '/commonData/dateStat',
    method: 'get',
    params: query
  })
}

export function getCommonDataAnalyse(query) {
  return request({
    url: '/commonData/analyse',
    method: 'get',
    params: query
  })
}

export function getCommonDataTimeline(query) {
  return request({
    url: '/commonData/timeline',
    method: 'get',
    params: query
  })
}

export function getNearestCommonData(query) {
  return request({
    url: '/commonData/getNearest',
    method: 'get',
    params: query
  })
}

export function statCommonData(query) {
  return request({
    url: '/commonData/stat',
    method: 'get',
    params: query
  })
}

export function getNameTree(query) {
  return request({
    url: '/commonData/nameTree',
    method: 'get',
    params: query
  })
}