import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatTest/getData',
    method: 'get',
    params: query
  })
}


export function getTreatTest(id) {
  return request({
    url: '/treatTest/get',
    method: 'get',
    params: { id }
  })
}

export function createTreatTest(data) {
  return request({
    url: '/treatTest/create',
    method: 'post',
    data
  })
}

export function updateTreatTest(data) {
  return request({
    url: '/treatTest/edit',
    method: 'post',
    data
  })
}
export function deleteTreatTest(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treatTest/delete',
    method: 'post',
    data
  })
}

export function getTreatTestCategoryTree(needRoot) {
  return request({
    url: '/treatTest/getTreatTestCategoryTree',
    method: 'get',
    params: { needRoot }
  })
}

export function getLastTreatTest(name) {
  return request({
    url: '/treatTest/getLastTest',
    method: 'get',
    params: { name }
  })
}

export function getTreatTestStat(query) {
  return request({
    url: '/treatTest/stat',
    method: 'get',
    params: query
  })
}
