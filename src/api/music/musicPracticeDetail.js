import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/musicPracticeDetail/list',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeDetail(detailId) {
  return request({
    url: '/musicPracticeDetail/get',
    method: 'get',
    params: { detailId }
  })
}

export function createMusicPracticeDetail(data) {
  return request({
    url: '/musicPracticeDetail/create',
    method: 'post',
    data
  })
}

export function editMusicPracticeDetail(data) {
  return request({
    url: '/musicPracticeDetail/edit',
    method: 'post',
    data
  })
}
export function deleteMusicPracticeDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/musicPracticeDetail/delete',
    method: 'post',
    data
  })
}

export function getTuneTree(tuneType) {
  return request({
    url: '/musicPracticeDetail/tuneTree',
    method: 'get',
    params: {
      tuneType:tuneType
    }
  })
}

export function getMusicPracticeNameStat(query) {
  return request({
    url: '/musicPracticeDetail/nameStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTuneLevelStat(query) {
  return request({
    url: '/musicPracticeDetail/levelStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeDetailStat(query) {
  return request({
    url: '/musicPracticeDetail/stat',
    method: 'get',
    params: query
  })
}

