import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/token/',
    method: 'post',
    data
  })
}

export function refreshToken(data) {
  return request({
    url: '/api/refresh/',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user-admin/user-self/',
    method: 'get'
  })
}

export function getUserList() {
  return request({
    url: '/user-admin/users/',
    method: 'get'
  })
}

export function addUser(data) {
  return request({
    url: '/user-admin/users/',
    data: data,
    method: 'post'
  })
}

export function deleteUser(id) {
  return request({
    url: '/user-admin/users/' + id + '/',
    method: 'delete'
  })
}

export function updateUser(id, data) {
  return request({
    url: '/user-admin/users/' + id + '/',
    data: data,
    method: 'put'
  })
}
