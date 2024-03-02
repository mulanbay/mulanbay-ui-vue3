import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/planReport/list',
    method: 'get',
    params: query
  })
}

export function getPlanReportStat(query) {
  return request({
    url: '/planReport/stat',
    method: 'get',
    params: query
  })
}

export function getPlanReportDateStat(query) {
  return request({
    url: '/planReport/dateStat',
    method: 'get',
    params: query
  })
}

export function getPlanReportAvgStat(query) {
  return request({
    url: '/planReport/avgStat',
    method: 'get',
    params: query
  })
}


export function getPlanTemplate(templateId) {
  return request({
    url: '/planReport/get',
    method: 'get',
    params: { templateId }
  })
}

export function manualStatPlanReport(data) {
  return request({
    url: '/planReport/manualStat',
    method: 'post',
    data
  })
}


export function reStatPlanReport(data) {
  return request({
    url: '/planReport/reStat',
    method: 'post',
    data
  })
}

export function getPlanReportTimelineStat(query) {
  return request({
    url: '/planReport/timelineStat',
    method: 'get',
    params: query
  })
}

export function reStatPlanReportTimeline(data) {
  return request({
    url: '/planReport/reStatTimeline',
    method: 'post',
    data
  })
}