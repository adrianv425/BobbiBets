<template>
  <div id="app">
             
     <div :class="$style.container">       
     
      <search/>
       
      <router-view/>
      <svgTitle/>
      <sidebar/>
      <sidebar-toggle/>
      <bNav/>
      </div>
  </div>
</template>

<script>
import Game from './components/Game.vue'
import Sidebar from '@/components/sidebar.vue'
import SidebarToggle from '@/components/sidebarToggle.vue'
import svgTitle from '@/components/Title.vue'
import search from '@/components/search.vue'
import bNav from '@/components/bNav.vue'
import betModal from '@/components/betModal.vue'

export default {
  
  name: 'app',
  components: {
    Game,
    Sidebar, SidebarToggle, 
    svgTitle, search, bNav,betModal
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,700');
@import url('https://fonts.googleapis.com/css?family=Baumans');
body {
  background-color: darkslategray;
  font-family: 'Baumans', cursive;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  padding-top: 0px;
}

nav {
  padding: 30px 0px 0px 0;
  height: 100%;
}

nav a {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: lighter;
  font-size: 250%;
  padding-left: 5%;
  margin-inline-start: 0.4em;
  padding-right: 5%;
  padding-top: 1%;
  padding-bottom: 1%;
}
body, html {
  margin: 0;
  height: 100%;
}
#app {
    width: 100%;
}
:root{
    --accent-color: white;
    --primary-color: darkslategray ;
    --secondary-color: lightgray;
    --dark-color: black;
  }
  
  *{
    box-sizing: border-box;
  }
</style>

<style module>
  .container{
    position: relative;
    left: 0;
    top: 3.1em;
    height: 100%;
    width: 100%;
    background-color: var(--primary-color);
  }
</style>
