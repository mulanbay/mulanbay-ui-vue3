import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/goodsLifetime/list',
    method: 'get',
    params: query
  })
}

export function getAndMathGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/getAndMath',
    method: 'post',
    data
  })
}

export function compareAndMathGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/compareAndMath',
    method: 'post',
    data
  })
}

export function getGoodsLifetime(lifetimeId) {
  return request({
    url: '/goodsLifetime/get',
    method: 'get',
    params: { lifetimeId }
  })
}

export function getGoodsLifetimeTree(needRoot) {
  return request({
    url: '/goodsLifetime/tree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/create',
    method: 'post',
    data
  })
}

export function editGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/edit',
    method: 'post',
    data
  })
}
export function deleteGoodsLifetime(ids) {
  const data = {
      ids
  }
  return request({
    url: '/goodsLifetime/delete',
    method: 'post',
    data
  })
}

export function aiMatch(goodsName) {
  const data = {
      goodsName
  }
  return request({
    url: '/goodsLifetime/aiMatch',
    method: 'post',
    data
  })
}
