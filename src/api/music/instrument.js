import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/instrument/list',
    method: 'get',
    params: query
  })
}

export function getInstrument(instrumentId) {
  return request({
    url: '/instrument/get',
    method: 'get',
    params: { instrumentId }
  })
}

export function getInstrumentTree(needRoot) {
  return request({
    url: '/instrument/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createInstrument(data) {
  return request({
    url: '/instrument/create',
    method: 'post',
    data
  })
}

export function editInstrument(data) {
  return request({
    url: '/instrument/edit',
    method: 'post',
    data
  })
}
export function deleteInstrument(ids) {
  const data = {
      ids
  }
  return request({
    url: '/instrument/delete',
    method: 'post',
    data
  })
}
