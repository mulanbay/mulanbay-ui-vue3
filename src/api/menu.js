import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/main/getRouters',
    method: 'get'
  })
}

//获取所有路由
export const getFullRouters = () => {
  return request({
    url: '/main/getFullRouters',
    method: 'get'
  })
}

