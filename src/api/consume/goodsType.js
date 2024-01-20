import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/goodsType/list',
    method: 'get',
    params: query
  })
}

export function fetchTreeList(query) {
  return request({
    url: '/goodsType/treeList',
    method: 'get',
    params: query
  })
}

export function getGoodsType(typeId) {
  return request({
    url: '/goodsType/get',
    method: 'get',
    params: { typeId }
  })
}

export function createGoodsType(data) {
  return request({
    url: '/goodsType/create',
    method: 'post',
    data
  })
}

export function editGoodsType(data) {
  return request({
    url: '/goodsType/edit',
    method: 'post',
    data
  })
}

export function deleteGoodsType(ids) {
  const data = {
      ids
  }
  return request({
    url: '/goodsType/delete',
    method: 'post',
    data
  })
}


export function getGoodsTypeTree(selfId) {
  return request({
    url: '/goodsType/tree',
    method: 'get',
    params: {
      selfId:selfId
    }
  })
}
