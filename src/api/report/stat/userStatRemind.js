import request from '@/utils/request'

export function getUserStatRemind(remindId) {
  return request({
    url: '/userStatRemind/get',
    method: 'get',
    params: { remindId }
  })
}

export function getUserStatRemindByStat(statId) {
  return request({
    url: '/userStatRemind/getByUserStat',
    method: 'get',
    params: { statId }
  })
}

export function createUserStatRemind(data) {
  return request({
    url: '/userStatRemind/create',
    method: 'post',
    data
  })
}

export function editUserStatRemind(data) {
  return request({
    url: '/userStatRemind/edit',
    method: 'post',
    data
  })
}
export function deleteUserStatRemind(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userStatRemind/delete',
    method: 'post',
    data
  })
}
