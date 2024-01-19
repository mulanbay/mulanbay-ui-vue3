import request from '@/utils/request'

export function getDetail() {
  return request({
    url: '/server/detail',
    method: 'get'
  })
}

export function statServer(resourceType) {
  return request({
    url: '/server/stat',
    method: 'get',
    params: { resourceType }
  })
}
