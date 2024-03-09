import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userScore/list',
    method: 'get',
    params: query
  })
}

export function getUserScore(scoreId) {
  return request({
    url: '/userScore/get',
    method: 'get',
    params: { scoreId }
  })
}

export function getUserScoreScoreDetail(scoreId) {
  return request({
    url: '/userScore/scoreDetail',
    method: 'get',
    params: { scoreId }
  })
}


export function deleteUserScore(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userScore/delete',
    method: 'post',
    data
  })
}

export function userScoreSelfJudge(data) {
  return request({
    url: '/userScore/selfJudge',
    method: 'post',
    data
  })
}

export function reSaveUserScore(data) {
  return request({
    url: '/userScore/reSave',
    method: 'post',
    data
  })
}

export function getUserScoreStat(query) {
  return request({
    url: '/userScore/stat',
    method: 'get',
    params: query
  })
}

export function getUserScoreAnalyse(query) {
  return request({
    url: '/userScore/analyse',
    method: 'get',
    params: query
  })
}

export function getUserScoreCompare(query) {
  return request({
    url: '/userScore/compare',
    method: 'get',
    params: query
  })
}