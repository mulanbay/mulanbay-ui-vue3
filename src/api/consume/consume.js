import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/consume/list',
    method: 'get',
    params: query
  })
}


export function getConsume(consumeId) {
  return request({
    url: '/consume/get',
    method: 'get',
    params: { consumeId }
  })
}

export function createConsume(data) {
  return request({
    url: '/consume/create',
    method: 'post',
    data
  })
}

export function editConsume(data) {
  return request({
    url: '/consume/edit',
    method: 'post',
    data
  })
}

export function deleteConsume(ids) {
  const data = {
      ids
  }
  return request({
    url: '/consume/delete',
    method: 'post',
    data
  })
}

export function setParentConsume(data) {
  return request({
    url: '/consume/setParent',
    method: 'post',
    data
  })
}

export function deleteParentConsume(data) {
  return request({
    url: '/consume/deleteParent',
    method: 'post',
    data
  })
}

export function deleteChlidrenConsume(data) {
  return request({
    url: '/consume/deleteChildren',
    method: 'post',
    data
  })
}

export function getConsumeCostStat(query) {
  return request({
    url: '/consume/costStat',
    method: 'get',
    params: query
  })
}

export function getConsumeTreeStat(query) {
  return request({
    url: '/consume/treeStat',
    method: 'get',
    params: query
  })
}

export function getConsumeTagTree(startDate,endDate,needRoot) {
  return request({
    url: '/consume/tagTree',
    method: 'get',
    params: {
      startDate:startDate,
      endDate:endDate ,
      needRoot:needRoot
    }
  })
}

export function getConsumeAnalyseStat(query) {
  return request({
    url: '/consume/analyseStat',
    method: 'get',
    params: query
  })
}

export function getConsumeGoodsNameAvgSimilarity(query) {
  return request({
    url: '/consume/getGoodsNameAvgSimilarity',
    method: 'get',
    params: query
  })
}

export function getConsumeUseTimeStat(query) {
  return request({
    url: '/consume/useTimeStat',
    method: 'get',
    params: query
  })
}

export function getConsumeUseTimeList(query) {
  return request({
    url: '/consume/useTimeList',
    method: 'get',
    params: query
  })
}

export function getConsumeDateStat(query) {
  return request({
    url: '/consume/dateStat',
    method: 'get',
    params: query
  })
}

export function getConsumeYoyStat(query) {
  return request({
    url: '/consume/yoyStat',
    method: 'get',
    params: query
  })
}

export function getConsumeKeywordsStat(query) {
  return request({
    url: '/consume/keywordsStat',
    method: 'get',
    params: query
  })
}

export function getConsumeKeywordsDetailStat(query) {
  return request({
    url: '/consume/keywordsDetailStat',
    method: 'get',
    params: query
  })
}

export function getConsumeWordCloudStat(query) {
  return request({
    url: '/consume/statWordCloud',
    method: 'get',
    params: query
  })
}

export function aiMatch(goodsName) {
  const data = {
      goodsName
  }
  return request({
    url: '/consume/aiMatch',
    method: 'post',
    data
  })
}