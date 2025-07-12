import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query
  })
}

export function getUser(userId) {
  return request({
    url: '/user/get',
    method: 'get',
    params: { 
		userId
	}
  })
}


export function offlineUser(userId) {
  return request({
    url: '/user/offline',
    method: 'post',
    data: { userId }
  })
}

export function deleteUserData(userId) {
  return request({
    url: '/user/deleteUserData',
    method: 'post',
    data: { userId }
  })
}

export function initUserData(userId) {
  return request({
    url: '/user/initUserData',
    method: 'post',
    data: { userId }
  })
}


export function getUserRoleTree(userId,separate,needRoot) {
  return request({
    url: '/user/userRoleTree',
    method: 'get',
    params: {
      userId:userId,
      separate:separate,
      needRoot:needRoot
    }
  })
}

export function saveUserRole(data) {
  return request({
    url: '/user/saveUserRole',
    method: 'post',
    data
  })
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function editUser(data) {
  return request({
    url: '/user/edit',
    method: 'post',
    data
  })
}

export function deleteUser(ids) {
  const data = {
      ids
  }
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

export function getUserResidentCity() {
  return request({
    url: '/user/getResidentCity',
    method: 'get'
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/user/uploadAvatar',
    method: 'post',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: data
  })
}

// 获取用户详细信息
export function getProfile() {
  return request({
    url: '/user/getProfile',
    method: 'get'
  })
}

export function editProfile(data) {
  return request({
    url: '/user/editProfile',
    method: 'post',
    data: data
  })
}

export function editPassword(data) {
  return request({
    url: '/user/editPassword',
    method: 'post',
    data: data
  })
}

export function editWxAccount(data) {
  return request({
    url: '/user/editWxAccount',
    method: 'post',
    data: data
  })
}

export function getWxAccount(userId) {
  return request({
    url: '/user/getWxAccount',
    method: 'get',
    params: { 
		userId
	}
  })
}