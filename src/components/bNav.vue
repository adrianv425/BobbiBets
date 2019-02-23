<template>
    <div class="bNav">
    <router-link to="/">Bet</router-link>
    <router-link to="/myBets">My Bets</router-link>
    <router-link to="/account">Account</router-link>
    </div>
</template>

<script>
export default {
    name: "bNav",
    data(){
        return{
            search:''
        }
    },
    methods: {
        searchGames(){
            
        }
    },
}
</script>

<style>  
.bNav{
    position: fixed;
    bottom: 0;
    left: 0;
    text-decoration: none;
    background: rgba(47, 79, 79, 1);
    width: 100%;
    height: 4em;
    padding-top:0.6em;
    text-align: center;
}
.bNav a{
    color: white;
    font-size: 28px;
    padding-left: 5%;
    padding-right: 5%;
}
</style>