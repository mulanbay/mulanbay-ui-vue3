import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/musicPractice/list',
    method: 'get',
    params: query
  })
}

export function getMusicPractice(practiceId) {
  return request({
    url: '/musicPractice/get',
    method: 'get',
    params: { practiceId }
  })
}

export function getMusicPracticeTillNowStat(practiceId) {
  return request({
    url: '/musicPractice/tillNowStat',
    method: 'get',
    params: { practiceId }
  })
}

export function createMusicPractice(data) {
  return request({
    url: '/musicPractice/create',
    method: 'post',
    data
  })
}

export function copyMusicPractice(data) {
  return request({
    url: '/musicPractice/copy',
    method: 'post',
    data
  })
}


export function editMusicPractice(data) {
  return request({
    url: '/musicPractice/edit',
    method: 'post',
    data
  })
}
export function deleteMusicPractice(ids) {
  const data = {
      ids
  }
  return request({
    url: '/musicPractice/delete',
    method: 'post',
    data
  })
}

export function getMusicPracticeDateStat(query) {
  return request({
    url: '/musicPractice/dateStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeOverallStat(query) {
  return request({
    url: '/musicPractice/overallStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTimeStat(query) {
  return request({
    url: '/musicPractice/timeStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeCompareStat(query) {
  return request({
    url: '/musicPractice/compareStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeYoyStat(query) {
  return request({
    url: '/musicPractice/yoyStat',
    method: 'get',
    params: query
  })
}
