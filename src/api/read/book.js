import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/book/list',
    method: 'get',
    params: query
  })
}

export function getBook(bookId) {
  return request({
    url: '/book/get',
    method: 'get',
    params: { bookId }
  })
}

export function getBookCostTimes(bookId) {
  return request({
    url: '/book/getCostTimes',
    method: 'get',
    params: { bookId }
  })
}

export function createBook(data) {
  return request({
    url: '/book/create',
    method: 'post',
    data
  })
}

export function editBook(data) {
  return request({
    url: '/book/edit',
    method: 'post',
    data
  })
}
export function deleteBook(ids) {
  const data = {
      ids
  }
  return request({
    url: '/book/delete',
    method: 'post',
    data
  })
}

export function getBookDateStat(query) {
  return request({
    url: '/book/dateStat',
    method: 'get',
    params: query
  })
}

export function getBookOverallStat(query) {
  return request({
    url: '/book/overallStat',
    method: 'get',
    params: query
  })
}


export function getBookAnalyseStat(query) {
  return request({
    url: '/book/analyseStat',
    method: 'get',
    params: query
  })
}

export function getBookFullStat(query) {
  return request({
    url: '/book/fullStat',
    method: 'get',
    params: query
  })
}

