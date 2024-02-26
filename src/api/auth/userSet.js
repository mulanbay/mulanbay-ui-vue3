import request from '@/utils/request'

export function getUserSet() {
  return request({
    url: '/userSet/get',
    method: 'get'
  })
}


export function editUserSet(data) {
  return request({
    url: '/userSet/edit',
    method: 'post',
    data
  })
}
