<template>
<div class="holder">
      <form @submit.prevent="searchGames">
      <input class="search" type="text" placeholder="Search for a game..." v-model="search" v-validate="'max:5'" name="search">
      </form>
      </div>
</template>

<script>
export default {
    name: "search",
    data(){
        return{
            search:''
        }
    },
    methods: {
        searchGames(){
            
        }
    }
}
</script>

<style scoped>
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"; 
  .search{
    width: 100%;
    border: 0;
    padding: 20px;
    padding-top:35px;
    font-size: 1em;
    background-color: #323333;
    color: #687F7F;
    max-height: 3em;
  }
.holder {
    background: #fff;
  }
  </style>