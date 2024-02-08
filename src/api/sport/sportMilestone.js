import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sportMilestone/list',
    method: 'get',
    params: query
  })
}


export function getSportMilestone(milestoneId) {
  return request({
    url: '/sportMilestone/get',
    method: 'get',
    params: { milestoneId }
  })
}

export function getSportMilestoneTree(needRoot) {
  return request({
    url: '/sportMilestone/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createSportMilestone(data) {
  return request({
    url: '/sportMilestone/create',
    method: 'post',
    data
  })
}

export function editSportMilestone(data) {
  return request({
    url: '/sportMilestone/edit',
    method: 'post',
    data
  })
}

export function deleteSportMilestone(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sportMilestone/delete',
    method: 'post',
    data
  })
}

export function getSportMilestoneStat(query) {
  return request({
    url: '/sportMilestone/stat',
    method: 'get',
    params: query
  })
}

export function refreshSportMilestone(data) {
  return request({
    url: '/sportMilestone/refresh',
    method: 'post',
    data
  })
}
