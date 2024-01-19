import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/handler/list',
    method: 'get',
    params: query
  })
}

export function getHandlerInfo(className) {
  return request({
    url: '/handler/info',
    method: 'get',
    params: { className }
  })
}

export function getMethodList(className) {
  return request({
    url: '/handler/methodList',
    method: 'get',
    params: { className }
  })
}


export function invokeHandlerMethod(data) {
  return request({
    url: '/handler/invokeMethod',
    method: 'post',
    data
  })
}

export function checkHandler(data) {
  return request({
    url: '/handler/check',
    method: 'post',
    data
  })
}

export function reloadHandler(data) {
  return request({
    url: '/handler/reload',
    method: 'post',
    data
  })
}
