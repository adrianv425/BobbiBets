<!--source code: https://github.com/ramsaylanier/vue-tutorials/tree/master/sidebar-->
<template>
  <div :class="$style.sidebar">
      <nav :class="$style.sidenav">
      <!-- Container for the demo -->
          <login/>
        <div @click="handleClick"><router-link to="/">
        <img class="d-inline-block" v-bind:src="require('../assets/baseball.png')" width="35" height="35"/> Baseball
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/basketball.png" width="35" height="35" class="d-inline-block" alt=""> Basketball
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/soccer.png" width="35" height="35" class="d-inline-block" alt=""> Soccer
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/football.png" width="35" height="35" class="d-inline-block" alt=""> Football
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/hockey.png" width="35" height="35" class="d-inline-block" alt=""> Hockey
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/boxing.png" width="35" height="35" class="d-inline-block" alt=""> Boxing
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/MMA.png" width="35" height="35" class="d-inline-block" alt=""> MMA
        </router-link><br></div>
        <div @click="handleClick"><router-link to="/">
        <img src="../assets/horse.png" width="35" height="35" class="d-inline-block" alt=""> Horses
        </router-link><br><br><br><br></div>
      </nav>
  </div>
</template>

<script>
  import {TweenMax, Power4} from 'gsap'
  import firebase from "firebase";
  import 'bootstrap/dist/css/bootstrap.css';
  import 'bootstrap-vue/dist/bootstrap-vue.css';
  import login from '@/components/login.vue';

  export default {
    name: 'sidebar',
    components:{
      login
    },
    data: function(){
      return {
      }
    },
    mounted () {
      TweenMax.set(this.$el, {
        x: this.$el.offsetWidth
      })
    },
    computed: {
      open () {
        return this.$store.state.ui.sidebarOpen
      }
    },
    methods: {
      handleClick () {
        this.$store.dispatch('toggleSidebar');
      },
    },
    watch: {
      open: function (open) {
        const dX = open ? 0 : this.$el.offsetWidth
        TweenMax.to(this.$el, 0.6, {
          x: dX,
          ease: Power4.easeOut
        })
      }
    },
  }
</script>

<style module>
  .sidebar{
    position: fixed;
    right: 0;
    top: 0;
    width: 300px;
    height: 100vh;
    max-width: 90vw;
    background-color: var(--accent-color);
    overflow-y: scroll;
  }
</style>