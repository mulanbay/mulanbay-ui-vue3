import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/archive/list',
    method: 'get',
    params: query
  })
}

export function getArchive(archiveId) {
  return request({
    url: '/archive/get',
    method: 'get',
    params: { archiveId }
  })
}

export function getArchiveSource(archiveId) {
  return request({
    url: '/archive/getSource',
    method: 'get',
    params: { archiveId }
  })
}

export function syncArchive(data) {
  return request({
    url: '/archive/sync',
    method: 'post',
    data
  })
}

export function createArchive(data) {
  return request({
    url: '/archive/create',
    method: 'post',
    data
  })
}

export function editArchive(data) {
  return request({
    url: '/archive/edit',
    method: 'post',
    data
  })
}
export function deleteArchive(ids) {
  const data = {
      ids
  }
  return request({
    url: '/archive/delete',
    method: 'post',
    data
  })
}
