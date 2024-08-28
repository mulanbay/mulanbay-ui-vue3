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

export function getAutoLock() {
  return request({
    url: '/system/getAutoLock',
    method: 'get'
  })
}

export function editAutoLock(data) {
  return request({
    url: '/system/editAutoLock',
    method: 'post',
    data
  })
}

//获取配置
export function getProperties() {
  return request({
    url: '/system/getProperties',
    method: 'get'
  })
}