import { login, getInfo } from '@/api/user'
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, removeToken, updateLastTime, removeLastTime } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  access: getAccessToken(),
  refresh: getRefreshToken(),
  name: '',
  avatar: '',
  roles: []
}

const mutations = {
  SET_ACCESS_TOKEN: (state, access) => {
    state.access = access
  },
  SET_REFRESH_TOKEN: (state, access) => {
    state.refresh = access
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        setAccessToken(response.access)
        setRefreshToken(response.refresh)
        updateLastTime()
        commit('SET_ACCESS_TOKEN', response.access)
        commit('SET_REFRESH_TOKEN', response.refresh)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const data = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { name } = data

        const roles = ['user_self']
        const { is_superuser } = data
        const { is_staff } = data
        const { all_action_permissions } = data
        if (is_superuser) {
          roles.push('super')
        } else if (is_staff) {
          roles.push('admin')
        } else {
          for (const ap in all_action_permissions) {
            roles.push(ap.app)
          }
        }
        data['roles'] = roles
        // roles must be a non-empty array
        if (!data.roles || data.roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        const avatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_ACCESS_TOKEN', '')
      commit('SET_REFRESH_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resetRouter()
      removeLastTime()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_ACCESS_TOKEN', '')
      commit('SET_REFRESH_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

