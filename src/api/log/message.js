import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/message/list',
    method: 'get',
    params: query
  })
}

export function fetchMyList(query) {
  return request({
    url: '/message/myList',
    method: 'get',
    params: query
  })
}

export function getMessage(msgId) {
  return request({
    url: '/message/get',
    method: 'get',
    params: { msgId }
  })
}

export function getUserMessage(msgId) {
  return request({
    url: '/message/getByUser',
    method: 'get',
    params: { id }
  })
}

export function getLatestMessage() {
  return request({
    url: '/message/getLatestMessage',
    method: 'get'
  })
}

export function getUserMessageByUser(id) {
  return request({
    url: '/message/getByUser',
    method: 'get',
    params: { id }
  })
}

export function sendMessage(data) {
  return request({
    url: '/message/send',
    method: 'post',
    data
  })
}

export function deleteMessage(ids) {
  const data = {
      ids
  }
  return request({
    url: '/message/delete',
    method: 'post',
    data
  })
}

export function resendMessage(msgId) {
  return request({
    url: '/message/resend',
    method: 'get',
    params: { msgId }
  })
}

export function getMessageDetail(msgId) {
  return request({
    url: '/message/detail',
    method: 'get',
    params: { msgId }
  })
}