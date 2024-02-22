import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/diet/list',
    method: 'get',
    params: query
  })
}

export function getDiet(dietId) {
  return request({
    url: '/diet/get',
    method: 'get',
    params: { dietId }
  })
}

export function getLatestDiet(query) {
  return request({
    url: '/diet/latest',
    method: 'get',
    params: query
  })
}

export function createDiet(data) {
  return request({
    url: '/diet/create',
    method: 'post',
    data
  })
}

export function editDiet(data) {
  return request({
    url: '/diet/edit',
    method: 'post',
    data
  })
}

export function deleteDiet(ids) {
  const data = {
      ids
  }
  return request({
    url: '/diet/delete',
    method: 'post',
    data
  })
}

export function getDietCateTree(fieldName) {
  return request({
    url: '/diet/cateTree',
    method: 'get',
    params: {
      fieldName
    }
  })
}

export function getDietAnalyse(query) {
  return request({
    url: '/diet/analyse',
    method: 'get',
    params: query
  })
}

export function getDietCompare(query) {
  return request({
    url: '/diet/compare',
    method: 'get',
    params: query
  })
}

export function getDietPriceAnalyse(query) {
  return request({
    url: '/diet/priceAnalyse',
    method: 'get',
    params: query
  })
}

export function getFoodsAvgSim(query) {
  return request({
    url: '/diet/foodsAvgSim',
    method: 'get',
    params: query
  })
}

export function statSimLog(query) {
  return request({
    url: '/diet/statSimLog',
    method: 'get',
    params: query
  })
}

export function statDietWordCloud(query) {
  return request({
    url: '/diet/statWordCloud',
    method: 'get',
    params: query
  })
}

export function getDietStat(query) {
  return request({
    url: '/diet/stat',
    method: 'get',
    params: query
  })
}

export function getDietTimeStat(query) {
  return request({
    url: '/diet/timeStat',
    method: 'get',
    params: query
  })
}
