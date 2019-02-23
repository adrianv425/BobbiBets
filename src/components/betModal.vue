<!--source code: https://github.com/ramsaylanier/vue-tutorials/tree/master/sidebar-->
<template>
  <div :class="$style.bet">
  <betModalToggle/>
  <h1 :class="$style.header">Bet Slip</h1>
  <div :class="$style.bets" v-if="confirmed===false">
    <div v-if="betslip.bets.gameID !== 0">
      {{betslip.bets.game.cardTitle}}
      <br>
      <img :class="$style.displayImages" v-bind:src="require('../assets/'+ betslip.bets.game.flag1)"/>vs.
      <img :class="$style.displayImages" v-bind:src="require('../assets/'+ betslip.bets.game.flag2)"/>
      <br>
      <div :class="$style.date">
        {{ betslip.bets.game.date | formatDate}}
      </div>
      <div v-if="betslip.bets.betType === 'MLT1'">
        <strong>{{ betslip.bets.game.team1 }}</strong> to win {{ betslip.bets.game.team2 }}.
        </div>
      <div v-else-if="betslip.bets.betType === 'MLT2'"> 
        <strong>{{ betslip.bets.game.team2 }}</strong> to win {{ betslip.bets.game.team1 }}.
        </div>
      <div v-else-if="betslip.bets.betType === 'SprT1'">
        <strong>{{ betslip.bets.game.team1 }}</strong> to win {{ betslip.bets.game.team2 }} after applying {{ betslip.bets.game.Pots.SprT1.spread }} points to {{ betslip.bets.game.team1 }} final score.
        </div>
      <div v-else-if="betslip.bets.betType === 'SprT2'"> 
        <strong>{{ betslip.bets.game.team2 }}</strong> to win {{ betslip.bets.game.team1 }} after applying {{ betslip.bets.game.Pots.SprT2.spread }} points to {{ betslip.bets.game.team2 }} final score.
        </div>
      <div v-else>
        {{ betslip.bets.game.team1 }} vs {{ betslip.bets.game.team2 }}<br>
        Score at end of game will be {{ betslip.bets.betType == 'TOver' ? 'more' : 'less'}} than {{ betslip.bets.game.Pots.TOver.prediction }}
      </div>
      <div align-center>Risk: $<input :class="$style.risks" placeholder="0" v-model="risk"/>
      To Win: ${{ ( betslip.bets.game.Pots[betslip.bets.betType].odds > 0 ) ? (risk*((betslip.bets.game.Pots[betslip.bets.betType].odds/100)+1)).toFixed(2) : (risk*((-1*(100/betslip.bets.game.Pots[betslip.bets.betType].odds))+1)).toFixed(2) }}
      </div>
    </div>
    <div v-if="login===true" :class="$style.betslipButtons">
      <b-button  :class="$style.confirmButton" :size="'sm'" :variant="'outline-danger'" @click="close">Cancel</b-button>
      <b-button  :class="$style.confirmButton" :size="'sm'" :variant="'outline-success'" @click="placeBet">Bet Now!</b-button>
    </div>
    <div v-else>
      <br><b-button href="#/login">Login</b-button> to place bet<br><br>
    </div>
  </div>
  <div v-else :class="$style.processing">
    <h3>Submitted</h3>
    Processing your bet. This usually takes 3-30 seconds. Once confirmed, this bet will show up on 'My Bets' tab.
    <div v-if="login===true" :class="$style.betslipButtons">
      <b-button  :class="$style.confirmButton" :size="'sm'" :variant="'outline-danger'" @click="close">Close</b-button>
      <b-button  :class="$style.confirmButton" :size="'sm'" :variant="'outline-success'" :href="'#/myBets'">Bet Tab</b-button>
    </div>
  </div>
  </div>
</template>

<script>
import { TweenMax, Power4 } from "gsap";
import login from "@/components/login.vue";
import betModalToggle from "@/components/betModalToggle.vue";
const firebase = require("firebase");
require("firebase/functions");

export default {
  name: "bet",

  components: {
    betModalToggle,
    login
  },
  props: {
    betSlip: {
      type: Object
    }
  },
  data() {
    return {
      risk: "",
      login: false,
      confirmed: false
    };
  },
  mounted() {
    TweenMax.set(this.$el, {
      x: -this.$el.offsetWidth * 2
    });
  },
  beforeMount(){
      this.getUser()
    },
  computed: {
    open() {
      return this.$store.state.ui.betOpen;
    },
    betslip: function() {
      return this.betSlip;
    }
  },
  methods: {
    close() {
      this.$store.dispatch("toggleBet");
    },
    placeBet() {
      this.confirmed = true;
      var placeBet = firebase.functions().httpsCallable("placeBet");
      placeBet({
        amount: this.risk,
        betType: this.betslip.bets.betType,
        gameID: this.betslip.bets.gameID
      })
        .then(function(result) {
          console.log("placeBet result: " + JSON.stringify(result));
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    getUser: function() {
        var u = firebase.auth().currentUser;
        if(u != undefined){
          this.login = true;
        }
        else
          this.login = false;
      },
    remove() {}
  },
  watch: {
    open: function(open) {
      const dX = open ? 0 : this.$el.offsetWidth;
      TweenMax.to(this.$el, 0.8, {
        x: -dX * 2,
        ease: Power4.easeOut
      });
    }
  }
};
</script>
<style module>
.date {
  margin: 0.5%;
}
.displayImages {
  max-height: 3em;
}
.risks {
  max-width: 15%;
  align-self: center;
}
.header {
  text-align: center;
  margin: 5%;
}
.betslipButtons {
  margin: 10% 5% 5% 5%;
  bottom: 3%;
}
.confirmButton {
  width: 40%;
  margin-left: 5%;
  margin-right: 5%;
}
.bets {
  margin: 5%;
  text-align: center;
  background: var(--secondary-color);
}
.bet {
  position: fixed;
  top: 4%;
  margin: 10% 10% 10% 10%;
  width: 80%;
  max-width: 80em;
  background-color: var(--accent-color);
}
.processing{
  margin: 5%;
  padding: 1%;
  background: var(--secondary-color);
}
.processing h3{
  text-align: center;
}
</style>