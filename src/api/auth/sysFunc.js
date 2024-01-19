import request from '@/utils/request'

// 获取列表
export function treeList(query) {
  return request({
    url: '/sysFunc/treeList',
    method: 'get',
    params: query
  })
}

export function getMenuTree(query) {
  return request({
    url: '/sysFunc/menuTree',
    method: 'get',
    params: query
  })
}

export function getFuncTree(query) {
  return request({
    url: '/sysFunc/funcTree',
    method: 'get',
    params: query
  })
}

// 查询
export function getSysFunc(funcId) {
  return request({
    url: '/sysFunc/get',
    method: 'get',
	params: {
		funcId: funcId
	}
  })
}

// 新增
export function createSysFunc(data) {
  return request({
    url: '/sysFunc/create',
    method: 'post',
    data: data
  })
}

// 修改
export function editSysFunc(data) {
  return request({
    url: '/sysFunc/edit',
    method: 'post',
    data: data
  })
}

// 删除
export function deleteSysFunc(ids) {
   const data = {
	    ids
   }
  return request({
    url: '/sysFunc/delete',
    method: 'post',
	data: data
  })
}


// 刷新配置
export function refreshCache() {
  return request({
    url: '/sysFunc/refreshCache',
    method: 'post'
  })
}