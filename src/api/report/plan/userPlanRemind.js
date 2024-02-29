import request from '@/utils/request'

export function getUserPlanRemind(remindId) {
  return request({
    url: '/userPlanRemind/get',
    method: 'get',
    params: { remindId }
  })
}

export function getUserPlanRemindByPlan(planId) {
  return request({
    url: '/userPlanRemind/getByUserPlan',
    method: 'get',
    params: { planId }
  })
}

export function createUserPlanRemind(data) {
  return request({
    url: '/userPlanRemind/create',
    method: 'post',
    data
  })
}

export function editUserPlanRemind(data) {
  return request({
    url: '/userPlanRemind/edit',
    method: 'post',
    data
  })
}
export function deleteUserPlanRemind(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userPlanRemind/delete',
    method: 'post',
    data
  })
}
