import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: false,
    userInfo: null,
    token: null
  },
  mutations: {
    setLoginStatus(state, status) {
      state.isLoggedIn = status
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setToken(state, token) {
      state.token = token
    },
    clearUserInfo(state) {
      state.userInfo = null
      state.token = null
    }
  },
  actions: {
    login({ commit }, { userInfo, token }) {
      commit('setLoginStatus', true)
      commit('setUserInfo', userInfo)
      commit('setToken', token)
      localStorage.setItem('token', token) // 存储 Token
    },
    logout({ commit }) {
      commit('setLoginStatus', false)
      commit('clearUserInfo')
      localStorage.removeItem('token') // 移除 Token
    },
    checkLoginStatus({ commit }) {
      const token = localStorage.getItem('token')
      if (token) {
        commit('setLoginStatus', true)
        commit('setToken', token)
      }
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    userInfo: state => state.userInfo,
    token: state => state.token
  }
})