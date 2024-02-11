import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatTest/list',
    method: 'get',
    params: query
  })
}


export function getTreatTest(testId) {
  return request({
    url: '/treatTest/get',
    method: 'get',
    params: { testId }
  })
}

export function createTreatTest(data) {
  return request({
    url: '/treatTest/create',
    method: 'post',
    data
  })
}

export function editTreatTest(data) {
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

export function getTreatTestCateTree(groupField,needRoot) {
  return request({
    url: '/treatTest/tree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getLastTreatTest(name) {
  return request({
    url: '/treatTest/lastTest',
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
