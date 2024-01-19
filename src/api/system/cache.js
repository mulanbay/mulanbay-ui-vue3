import request from '@/utils/request'

export function getInfo() {
  return request({
    url: '/cache/info',
    method: 'get'
  })
}

export function listCacheName() {
  return request({
    url: '/cache/names',
    method: 'get'
  })
}

export function listCacheKey(cacheName) {
  return request({
    url: '/cache/getCacheKeys',
    method: 'get',
    params: { cacheName }
  })
}


export function getCacheValue(cacheName,cacheKey) {
  let para ={
	  cacheName: cacheName,
	  cacheKey: cacheKey
  }
  return request({
    url: '/cache/getCacheValue',
    method: 'get',
    params: para
  })
}

export function deleteCacheKey(cacheKey) {
  const data = {
      cacheKey
  }
  return request({
    url: '/cache/deleteCacheKey',
    method: 'post',
    data
  })
}

// 清理指定名称缓存
export function deleteCacheName(cacheName) {
  const data = {
      cacheName
  }
  return request({
    url: '/cache/deleteCacheName',
    method: 'post',
    data
  })
}

// 清理全部缓存
export function deleteAllCache() {
  return request({
    url: '/cache/deleteAll',
    method: 'post'
  })
}