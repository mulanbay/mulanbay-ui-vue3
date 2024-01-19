import request from '@/utils/request'


export function getMonitorUserTree(userId,separate,needRoot) {
  return request({
    url: '/monitorUser/tree',
    method: 'get',
    params: {
      userId:userId,
      separate:separate,
      needRoot:needRoot
    }
  })
}

export function saveMonitorUser(data) {
  return request({
    url: '/monitorUser/save',
    method: 'post',
    data
  })
}
