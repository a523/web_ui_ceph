export function getAccessToken() {
  return sessionStorage.getItem('access')
}

export function getRefreshToken() {
  return sessionStorage.getItem('refresh')
}

export function setAccessToken(access) {
  sessionStorage.setItem('access', access)
}

export function setRefreshToken(refresh) {
  sessionStorage.setItem('refresh', refresh)
}

export function removeToken() {
  sessionStorage.removeItem('refresh')
  sessionStorage.removeItem('access')
}

export function updateLastTime() {
  const now = new Date()
  sessionStorage.setItem('lastUpdateTime', now)
  console.log('set update time')
}

export function removeLastTime() {
  sessionStorage.removeItem('lastUpdateTime')
}

const expireTime = 10 // 分钟

export function inExpiration() {
  const now = new Date()
  const lastTime = new Date(sessionStorage.getItem('lastUpdateTime'))
  if (!lastTime) {
    return false
  } else {
    return (now - lastTime) / (60 * 1000) < expireTime
  }
}
