<template>
  <div class = "lay row">
    <div class="game col-sm" v-for="game in object" v-if="game.active==1" :key="game.key">
      <a row wrap align-center>
        <a class="matchup" v-bind:href="game.url">

        <h4>{{game.cardTitle}}</h4>
        <img class="title1" v-bind:src="require('../assets/'+game.flag1)"/>
        <img class="title1" v-bind:src="require('../assets/'+game.flag2)"/>
        <p>{{game.team1}} vs. 
        {{game.team2}}</p>
        <p>
          {{game.date | formatDate}}
        </p>
        <h5>MoneyLine</h5>
        <b-button @click="handleClick2(game.gameID, 'MLT1')" class="but" :size="'sm'" :variant="'outline-success' ">
          <img class="ML" v-bind:src="require('../assets/'+game.flag1)"/>
        {{(game.Pots.MLT1.odds > 0) ? '+' + game.Pots.MLT1.odds : game.Pots.MLT1.odds }}
        </b-button>
        
        <b-button @click="handleClick2(game.gameID, 'MLT2')" class="but" :size="'sm'" :variant="'outline-success'">
        <img class="ML" v-bind:src="require('../assets/'+game.flag2)"/>
        {{(game.Pots.MLT2.odds > 0) ? '+' + game.Pots.MLT2.odds : game.Pots.MLT2.odds }}
        </b-button><br>
        <a v-if="game.Pots.SprT1.odds != 0 && game.Pots.SprT2.odds != 0">
        <h5>Spread</h5>
        <b-button  @click="handleClick2(game.gameID, 'SprT1')" class="but1" :size="'sm'" :variant="'outline-success'">
          <img class="ML" v-bind:src="require('../assets/'+game.flag1)"/>
            {{(game.Pots.SprT1.spread > 0) ? '+' + game.Pots.SprT1.spread : game.Pots.SprT1.spread }}<br>{{(game.Pots.SprT1.odds > 0) ? '+' + game.Pots.SprT1.odds : game.Pots.SprT1.odds }}
        </b-button>
        
        <b-button  @click="handleClick2(game.gameID, 'SprT2')" class="but1" :size="'sm'" :variant="'outline-success'">
          <img class="ML" v-bind:src="require('../assets/'+game.flag2)"/>
          <div> {{(game.Pots.SprT2.spread > 0) ? '+' + game.Pots.SprT2.spread : game.Pots.SprT2.spread }}<br>{{(game.Pots.SprT2.odds > 0) ? '+' + game.Pots.SprT2.odds : game.Pots.SprT2.odds }}</div>
        </b-button>
        </a>
        <a v-if="game.Pots.TOver.odds != 0 && game.Pots.TUnder.odds != 0">
        <h5>Total Score</h5>
        <b-button  @click="handleClick2(game.gameID, 'TUnder')" class="spread" :size="'sm'" :variant="'outline-success'">
          Under {{ game.Pots.TOver.prediction }}<br>
          {{(game.Pots.TOver.odds > 0) ? '+' + game.Pots.TOver.odds : game.Pots.TOver.odds }}
        </b-button>
        <b-button  @click="handleClick2(game.gameID, 'TOver')" class="spread" :size="'sm'" :variant="'outline-success'">
          Over {{ game.Pots.TOver.prediction }}<br>
          {{(game.Pots.TUnder.odds > 0) ? '+' + game.Pots.TUnder.odds : game.Pots.TUnder.odds }}
        </b-button>
        </a>              
        </a>
      </a>
    </div>
    <bet-modal v-bind:betSlip="betSlip"/>
  </div>
</template>
<script>
import Firebase from "firebase";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import betModal from '@/components/betModal.vue'

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDXe32BuZMREuwUzL3BtdEEaGL4nke_F5o",
    authDomain: "betbobbi.firebaseapp.com",
    databaseURL: "https://betbobbi.firebaseio.com",
    projectId: "betbobbi",
    storageBucket: "",
    messagingSenderId: "835300689356"
  };
  let app = Firebase.initializeApp(config);

  var functions = Firebase.functions();

export default {
  name: 'Game',
  components:{
    betModal
  },
  data() {
    return {
      Object: {},
      betSlip : {
        bets: {
          gameID: 0,
          game: {},
          betType: '',
          amount: 0
        },
        total: 0
      }
    }
  },
  beforeMount(){
    this.getGames();
  },
  computed: {
    open () {
      return this.$store.state.ui.betOpen
    },
    object: function() {
      return this.Object;
    }
  },
  methods: {
    getGames(){
      var getGames = Firebase.functions().httpsCallable('getGames');
      getGames().then(result => {
        this.Object = result.data;
        console.log(result.data);
      });
    },
    handleClick2 (g, t) {
      console.log(t);
      this.betSlip.bets = {
        gameID: this.object[g].gameID,
        betType: t,
        game: this.object[g],
        amount: 0
      };
      console.log(g);
      console.log(this.betSlip);
      this.$store.dispatch('toggleBet');
    },
    handleClick () {
      this.$store.dispatch('toggleBet')
    }
  }
}
</script>

<style>
.lay{
  display: flex;
  overflow-wrap: break-word;
  margin-bottom: 6em;
}
.spread{
  margin: 1em 1em 1em 1em;
}
.but{
  margin: 0.3em;
  max-width: 50%;
}
.but1{
  display: inline-flex;
  flex-flow: row;
  margin: 0.3em;
  max-width: 50%;
}
.title1{
  margin: 0em 1em 0 1em;
  width: auto;
  height: auto;
  max-width: 5em;
  max-height: 5em;
}
.ML{
  width: auto;
  height: auto;
  max-width: 4em;
  max-height: 3em;
}

.game{
  background: #323333;
  padding-bottom: 1em;
  padding-top: 1em;
  width: 100%;
  min-width: 16em;
  max-width: 22em;
  margin: 3em;
  text-align: center;
  color: hsl(0, 0%, 90%);
}

.team1{
  -webkit-clip-path: polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);
  clip-path: polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);
  margin: .5em;
}
.team2{
  -webkit-clip-path: polygon(25% 0, 100% 0, 100% 100%, 25% 100%, 0 50%);
  clip-path: polygon(25% 0, 100% 0, 100% 100%, 25% 100%, 0 50%);
  margin: .5em;
}

</style>