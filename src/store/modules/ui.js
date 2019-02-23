import * as types from '../mutation-types'

// initial state
// shape: [{ id, quantity }]
const state = {
  sidebarOpen: false,
  betOpen: false,
}

// getters
const getters = {
  sidebarOpen: state => state.sidebarOpen,
  betOpen: state => state.betOpen
}

// actions
const actions = {
  toggleSidebar ({ commit }) {
    commit(types.TOGGLE_SIDEBAR)
  },
  toggleBet ({ commit }) {
    commit(types.TOGGLE_BET)
  }
}

// mutations
const mutations = {
  [types.TOGGLE_SIDEBAR] (state) {
    state.sidebarOpen = !state.sidebarOpen
  },
  [types.TOGGLE_BET](state){
    state.betOpen = !state.betOpen
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
