import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/token/',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user-admin/self/',
    method: 'get'
  })
}

export function getUserList() {
  return request({
    url: '/user-admin/users/',
    method: 'get'
  })
}
