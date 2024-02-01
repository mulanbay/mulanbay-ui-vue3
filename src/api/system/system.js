import request from '@/utils/request'

export function lockSystem(data) {
  return request({
    url: '/system/lock',
    method: 'post',
    data
  })
}

export function unlockSystem(data) {
  return request({
    url: '/system/unlock',
    method: 'post',
    data
  })
}

