import Vue from 'vue'
import Router from 'vue-router'
import Bets from './components/myBets.vue'
import Game from './components/Game.vue'
import account from './components/account.vue'
import login from './components/login.vue'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/',
      component: login
    },
    {
      path: '/',
      name: 'game',
      component: Game
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/myBets',
      name: 'Bets',
      component: Bets,
      meta:{
        requiresAuth: true
      }
    },
    {
      path: '/account',
      name: 'Account',
      component: account,
      meta:{
        requiresAuth: true
      },
    }   
  ]
})

router.beforeEach((to, from, next) =>{
  let currentUser = firebase.auth().currentUser;
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if(requiresAuth && !currentUser) next('/login')
  else next()
})

export default router