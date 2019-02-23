import Vue from 'vue'
import App from './App.vue'
import VeeValidate from 'vee-validate'
import router from './router'
import store from './store'
import SvgSprite from 'vue-svg-sprite'
import VueFire from 'vuefire'
import BootstrapVue from 'bootstrap-vue'
import moment from 'moment'
import firebase from 'firebase'

Vue.use(BootstrapVue);

Vue.use(SvgSprite, {
  url: '/assets/logo.svg',
  class: 'my-class',
});
Vue.use(VeeValidate)

Vue.use(VueFire)
Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})

Vue.config.productionTip = false

let app;
  // Initialize Firebase
let config = {
    apiKey: "AIzaSyDXe32BuZMREuwUzL3BtdEEaGL4nke_F5o",
    authDomain: "betbobbi.firebaseapp.com",
    databaseURL: "https://betbobbi.firebaseio.com",
    projectId: "betbobbi",
    storageBucket: "",
    messagingSenderId: "835300689356"
  };
  
  firebase.initializeApp(config, 'account');
  firebase.auth().onAuthStateChanged(function(){
    if(!app){
      new Vue({
        router,               // Add this line
        store,
        render: h => h(App)
      }).$mount('#app')
    }
  })

