<template>
<div :class="$style.b">
  <div v-for="bet in myBets" :key="bet.key" v-if="myBets!==null">
    <div :class="$style.bets" v-if="games[bet.gameID]!=undefined">
      {{games[bet.gameID].cardTitle}}
     <br>
      <img :class="$style.displayImages" v-bind:src="require('../assets/'+ games[bet.gameID].flag1)"/>vs.
      <img :class="$style.displayImages" v-bind:src="require('../assets/'+ games[bet.gameID].flag2)"/>
      <br>
      <div :class="$style.date">
        {{ games[bet.gameID].date | formatDate}}
      </div>
      Risk: ${{bet.amount}} <strong :class="$style.status">Confirmed</strong>
      <div v-if="bet.betType === 'MLT1'">
        <strong>{{ games[bet.gameID].team1 }}</strong> to win {{ games[bet.gameID].team2 }}.
        </div>
      <div v-else-if="bet.betType === 'MLT2'"> 
        <strong>{{ games[bet.gameID].team2 }}</strong> to win {{ games[bet.gameID].team1 }}.
        </div>
      <div v-else-if="bet.betType === 'SprT1'">
        <strong>{{ games[bet.gameID].team1 }}</strong> to win {{ games[bet.gameID].team2 }} after applying {{ games[bet.gameID].Pots.SprT1.spread }} points to {{ games[bet.gameID].team1 }} final score.
        </div>
      <div v-else-if="bet.betType === 'SprT2'"> 
        <strong>{{ games[bet.gameID].team2 }}</strong> to win {{ games[bet.gameID].team1 }} after applying {{ games[bet.gameID].Pots.SprT2.spread }} points to {{ games[bet.gameID].team2 }} final score.
        </div>
      <div v-else>
        {{ games[bet.gameID].team1 }} vs {{ games[bet.gameID].team2 }}<br>
        Score at end of game will be {{ bet.betType == 'TOver' ? 'more' : 'less'}} than {{ games[bet.gameID].Pots.TOver.prediction }}
      </div>
    </div>
  </div>
      <div v-else>
      No bets. Try placing a bet or reloading the page.
    </div>
</div>
</template>

<script>
import firebase from "firebase";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

export default {
  name: 'bets',
  data() {
    return {
      Games: [],
      MyBets: []
    }
  },
  computed: {
    games: function(){
      return this.Games;
    },
    myBets: function(){
      return this.MyBets;
    }
  },
  beforeMount() {
    this.getBets();
    this.getGames();
  },
  methods: {
    getGames(){
      var getGames = firebase.functions().httpsCallable('getGames');
      getGames().then(result => {
        this.Games = result.data;
      });
    },
    getBets(){
      var getBets = firebase.functions().httpsCallable('getBets');
        getBets().then(result => {
      this.MyBets = result.data;
      console.log("myBets = "+ JSON.stringify(this.myBets));
    });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style module>
.b{
  margin-bottom: 5em;
}
.date{
  margin: 0.5%;
}
.displayImages{
  max-height: 3em;
}
.bets{
  text-align: center;
  background: #fff;
  margin: 5%;
}
.status{
  color: green
}
</style>
<style scoped>
@import "https://cdn.jsdelivr.net/npm/animate.css@3.5.1";
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"; 
  input {
    width: 100%;
    border: 0;
    padding: 20px;
    font-size: 1.3em;
    background-color: #323333;
    color: #687F7F;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  
  ul li {
    padding: 20px;
    font-size: 1.3em;
    background-color: #E0EDF4;
    border-left: 5px solid #3EB3F6;
    margin-bottom: 2px;
    color: #3E5252;
  }

  p {
    text-align:center;
    padding: 30px 0;
    color: gray;
  }

  .container {
    box-shadow: 0px 0px 40px lightgray;
  }
  .alert {
    background: #fdf2ce;
    font-weight: bold;
    display: inline-block;
    padding: 5px;
    margin-top: -20px;
  }
  .alert-in-enter-active{
    animation: bounce-in .5s;
  }
  .alert-in-leave-active{
    animation: bounce-in .5s reverse;
  }
  @keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
