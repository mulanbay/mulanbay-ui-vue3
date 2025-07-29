import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treat/list',
    method: 'get',
    params: query
  })
}


export function getTreat(treatId) {
  return request({
    url: '/treat/get',
    method: 'get',
    params: { treatId }
  })
}

export function createTreat(data) {
  return request({
    url: '/treat/create',
    method: 'post',
    data
  })
}

export function editTreat(data) {
  return request({
    url: '/treat/edit',
    method: 'post',
    data
  })
}

export function copyTreat(data) {
  return request({
    url: '/treat/copy',
    method: 'post',
    data
  })
}

export function deleteTreat(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treat/delete',
    method: 'post',
    data
  })
}

export function getTreatCateTree(groupField,needRoot) {
  return request({
    url: '/treat/tree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getTreatCateTreeEH(para) {
  return request({
    url: '/treat/tree',
    method: 'get',
    params: para
  })
}

export function getTreatRelation(query) {
  return request({
    url: '/treat/relation',
    method: 'get',
    params: query
  })
}

export function getTreatFullStat(query) {
  return request({
    url: '/treat/fullStat',
    method: 'get',
    params: query
  })
}

export function getTreatDateStat(query) {
  return request({
    url: '/treat/dateStat',
    method: 'get',
    params: query
  })
}

export function getTreatOverallStat(query) {
  return request({
    url: '/treat/overallStat',
    method: 'get',
    params: query
  })
}

export function getTreatAnalyseStat(query) {
  return request({
    url: '/treat/analyseStat',
    method: 'get',
    params: query
  })
}

export function getTreatYoyStat(query) {
  return request({
    url: '/treat/yoyStat',
    method: 'get',
    params: query
  })
}

export function getTreatStat(query) {
  return request({
    url: '/treat/stat',
    method: 'get',
    params: query
  })
}

