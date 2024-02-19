import request from '@/utils/request'

/**
 * 获取枚举参数
 * @param {Object} enumClass
 * @param {Object} idType
 * @param {Object} needRoot
 */
export function getEnumDict(enumClass,idType,needRoot) {
  return request({
    url: '/common/enumDict',
    method: 'get',
    params: {
      enumClass:enumClass,
      idType:idType,
      needRoot:needRoot
    }
  })
}

export function getDictItemTree(code,needRoot) {
  return request({
    url: '/dictItem/tree',
    method: 'get',
    params: {
      code:code,
      needRoot:needRoot,
      status:'ENABLE'
    }
  })
}

export function getYearList(needRoot) {
  return request({
    url: '/common/yearList',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getBussTypeList(needRoot) {
  return request({
    url: '/common/bussTypeList',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getEnumClassList(needRoot) {
  return request({
    url: '/common/enumClassList',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getDomainClassList(needRoot) {
  return request({
    url: '/common/domainClassList',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getCountryTree() {
  return request({
    url: '/country/tree',
    method: 'get'
  })
}

export function getProvinceTree() {
  return request({
    url: '/province/tree',
    method: 'get'
  })
}

export function getCityTree(provinceId) {
  return request({
    url: '/city/tree',
    method: 'get',
    params: {
      provinceId:provinceId
    }
  })
}

export function getDistrictTree(cityId) {
  return request({
    url: '/district/tree',
    method: 'get',
    params: {
      cityId:cityId
    }
  })
}