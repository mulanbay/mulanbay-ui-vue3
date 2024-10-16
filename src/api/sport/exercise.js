import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/exercise/list',
    method: 'get',
    params: query
  })
}

export function getExercise(exerciseId) {
  return request({
    url: '/exercise/get',
    method: 'get',
    params: { exerciseId }
  })
}

export function getExerciseByMultiStat(query) {
  return request({
    url: '/exercise/getByMultiStat',
    method: 'get',
    params: query
  })
}

export function createExercise(data) {
  return request({
    url: '/exercise/create',
    method: 'post',
    data
  })
}

export function editExercise(data) {
  return request({
    url: '/exercise/edit',
    method: 'post',
    data
  })
}

export function deleteExercise(ids) {
  const data = {
      ids
  }
  return request({
    url: '/exercise/delete',
    method: 'post',
    data
  })
}

export function getExerciseMultiStat(query) {
  return request({
    url: '/exercise/multiStat',
    method: 'get',
    params: query
  })
}

export function refreshExerciseMaxStat(query) {
  return request({
    url: '/exercise/refreshMaxStat',
    method: 'get',
    params: query
  })
}

export function getExerciseAchieveMilestones(query) {
  return request({
    url: '/exercise/achieveMilestones',
    method: 'get',
    params: query
  })
}

export function getNextAchieveMilestone(query) {
  return request({
    url: '/exercise/nextAchieveMilestone',
    method: 'get',
    params: query
  })
}

export function getExerciseDateStat(query) {
  return request({
    url: '/exercise/dateStat',
    method: 'get',
    params: query
  })
}

export function getExerciseItemStat(query) {
  return request({
    url: '/exercise/itemStat',
    method: 'get',
    params: query
  })
}

export function getExerciseOverallStat(query) {
  return request({
    url: '/exercise/overallStat',
    method: 'get',
    params: query
  })
}

export function getExerciseYoyStat(query) {
  return request({
    url: '/exercise/yoyStat',
    method: 'get',
    params: query
  })
}

