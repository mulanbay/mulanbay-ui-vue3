import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatDrugDetail/list',
    method: 'get',
    params: query
  })
}


export function getTreatDrugDetail(detailId) {
  return request({
    url: '/treatDrugDetail/get',
    method: 'get',
    params: { detailId }
  })
}

export function createTreatDrugDetail(data) {
  return request({
    url: '/treatDrugDetail/create',
    method: 'post',
    data
  })
}

export function copyTreatDrugDetail(data) {
  return request({
    url: '/treatDrugDetail/copy',
    method: 'post',
    data
  })
}

export function editTreatDrugDetail(data) {
  return request({
    url: '/treatDrugDetail/edit',
    method: 'post',
    data
  })
}
export function deleteTreatDrugDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treatDrugDetail/delete',
    method: 'post',
    data
  })
}

export function getTreatDrugDetailCalendarStat(query) {
  return request({
    url: '/treatDrugDetail/calendarStat',
    method: 'get',
    params: query
  })
}

export function getTreatDrugDetailStat(query) {
  return request({
    url: '/treatDrugDetail/stat',
    method: 'get',
    params: query
  })
}

export function getTreatDrugDetailTimeStat(query) {
  return request({
    url: '/treatDrugDetail/timeStat',
    method: 'get',
    params: query
  })
}
