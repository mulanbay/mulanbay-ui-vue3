import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/experience/list',
    method: 'get',
    params: query
  })
}

export function getExperience(expId) {
  return request({
    url: '/experience/get',
    method: 'get',
    params: { expId }
  })
}

export function createExperience(data) {
  return request({
    url: '/experience/create',
    method: 'post',
    data
  })
}

export function editExperience(data) {
  return request({
    url: '/experience/edit',
    method: 'post',
    data
  })
}
export function deleteExperience(ids) {
  const data = {
      ids
  }
  return request({
    url: '/experience/delete',
    method: 'post',
    data
  })
}


export function getExperienceTree(needRoot) {
  return request({
    url: '/experience/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getExperienceStartCityTree(needRoot) {
  return request({
    url: '/experience/startCityTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}


export function getExperienceCostStat(query) {
  return request({
    url: '/experience/costStat',
    method: 'get',
    params: query
  })
}

export function getExperienceDateStat(query) {
  return request({
    url: '/experience/dateStat',
    method: 'get',
    params: query
  })
}

export function getExperienceYoyStat(query) {
  return request({
    url: '/experience/yoyStat',
    method: 'get',
    params: query
  })
}

export function getExperienceMapStat(query) {
  return request({
    url: '/experience/mapStat',
    method: 'get',
    params: query
  })
}

export function getExperienceTransferDetailMap(query) {
  return request({
    url: '/experience/transferDetailMap',
    method: 'get',
    params: query
  })
}

export function getExperienceTransferMapStat(query) {
  return request({
    url: '/experience/transferMapStat',
    method: 'get',
    params: query
  })
}

export function getExperienceWouldCloudStat(query) {
  return request({
    url: '/experience/wordCloudStat',
    method: 'get',
    params: query
  })
}
