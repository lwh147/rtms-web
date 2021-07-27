import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getToken() {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function setToken(token) {
  return Cookies.set(ACCESS_TOKEN_KEY, token)
}

export function setRefreshToken(refreshToken) {
  return Cookies.set(REFRESH_TOKEN_KEY, refreshToken)
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export function removeToken() {
  return Cookies.remove(ACCESS_TOKEN_KEY)
}

export function removeRefreshToken() {
  return Cookies.remove(REFRESH_TOKEN_KEY)
}
