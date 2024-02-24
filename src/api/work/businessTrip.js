import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/businessTrip/list',
    method: 'get',
    params: query
  })
}

export function getBusinessTrip(tripId) {
  return request({
    url: '/businessTrip/get',
    method: 'get',
    params: { tripId }
  })
}

export function createBusinessTrip(data) {
  return request({
    url: '/businessTrip/create',
    method: 'post',
    data
  })
}

export function editBusinessTrip(data) {
  return request({
    url: '/businessTrip/edit',
    method: 'post',
    data
  })
}

export function deleteBusinessTrip(ids) {
  const data = {
      ids
  }
  return request({
    url: '/businessTrip/delete',
    method: 'post',
    data
  })
}

export function getBusinessTripDateStat(query) {
  return request({
    url: '/businessTrip/dateStat',
    method: 'get',
    params: query
  })
}

export function getBusinessTripMapStat(query) {
  return request({
    url: '/businessTrip/mapStat',
    method: 'get',
    params: query
  })
}