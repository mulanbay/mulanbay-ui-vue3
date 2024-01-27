import request from '@/utils/request'

export function deleteAccountSnapshot(snapshotId) {
  const data = {
      snapshotId
  }
  return request({
    url: '/accountSnapshot/delete',
    method: 'post',
    data
  })
}

export function getAccountSnapshotTree(query) {
  return request({
    url: '/accountSnapshot/tree',
    method: 'get',
    params:query
  })
}
