import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userReward/list',
    method: 'get',
    params: query
  })
}

export function getUserRewardSourceDetail(id) {
  return request({
    url: '/userReward/sourceDetail',
    method: 'get',
    params: { id }
  })
}


export function deleteUserReward(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userReward/delete',
    method: 'post',
    data
  })
}

export function getUserRewardSourceStat(query) {
  return request({
    url: '/userReward/sourceStat',
    method: 'get',
    params: query
  })
}

export function getUserRewardDateStat(query) {
  return request({
    url: '/userReward/dateStat',
    method: 'get',
    params: query
  })
}
