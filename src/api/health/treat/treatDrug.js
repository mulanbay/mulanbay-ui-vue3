import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatDrug/list',
    method: 'get',
    params: query
  })
}


export function getTreatDrug(drugId) {
  return request({
    url: '/treatDrug/get',
    method: 'get',
    params: { drugId }
  })
}

export function getLastTreatDrug(drugName) {
  return request({
    url: '/treatDrug/lastDrug',
    method: 'get',
    params: { drugName }
  })
}

export function createTreatDrug(data) {
  return request({
    url: '/treatDrug/create',
    method: 'post',
    data
  })
}

export function editTreatDrug(data) {
  return request({
    url: '/treatDrug/edit',
    method: 'post',
    data
  })
}
export function deleteTreatDrug(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treatDrug/delete',
    method: 'post',
    data
  })
}


export function getTreatDrugCateTree(groupField,needRoot) {
  return request({
    url: '/treatDrug/tree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getCalendar(query) {
  return request({
    url: '/treatDrug/calendar',
    method: 'get',
    params: query
  })
}

