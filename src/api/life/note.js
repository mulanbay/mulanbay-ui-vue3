import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/note/list',
    method: 'get',
    params: query
  })
}

export function getNote(noteId) {
  return request({
    url: '/note/get',
    method: 'get',
    params: { noteId }
  })
}

export function createNote(data) {
  return request({
    url: '/note/create',
    method: 'post',
    data
  })
}

export function editNote(data) {
  return request({
    url: '/note/edit',
    method: 'post',
    data
  })
}
export function deleteNote(ids) {
  const data = {
      ids
  }
  return request({
    url: '/note/delete',
    method: 'post',
    data
  })
}
