import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/command/list',
    method: 'get',
    params: query
  })
}

export function exeCmd(data) {
  return request({
    url: '/command/exe',
    method: 'post',
    data
  })
}

export function getCommand(id) {
  return request({
    url: '/command/get',
    method: 'get',
    params: { id }
  })
}

export function createCommand(data) {
  return request({
    url: '/command/create',
    method: 'post',
    data
  })
}

export function editCommand(data) {
  return request({
    url: '/command/edit',
    method: 'post',
    data
  })
}

export function deleteCommand(ids) {
  const data = {
      ids
  }
  return request({
    url: '/command/delete',
    method: 'post',
    data
  })
}

