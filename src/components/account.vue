<template>
  <div class="account">
    <div class="holder">
      <div class='username' v-if='user.displayName'>
      <p>{{user.displayName || 'undef'}}</p> 
      <b-button @click="handleChange">change</b-button>
      </div>
      <div class='username' v-else><input v-model='name' placeholder="Enter name"><b-button @click="updateName">submit</b-button></div>        <p> Account email: {{ user.email }}</p>
        <p> Balance: ${{balance}} </p>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: 'account',
  data() {
    return {
      user: '',
      name: '',
      balance: 0
    }
  },
  beforeMount(){
    this.getUser();
  },
  methods: {  
    handleChange: function(){
      this.user.displayName=undefined;
    },
    getUser: function() {
        var u = firebase.auth().currentUser
        if(u != undefined){
          this.user = u;
        }
        var getBalance = firebase.functions().httpsCallable('getBalance');
        getBalance().then(result => {
        this.balance = result.data;
      });
    },
    updateName: function(){
        console.log("trying");
        var u = firebase.auth().currentUser;
        this.user.displayName=this.name;
        u.updateProfile({
          displayName: this.name,
          photoURL : ''
        }).then(function(){
          //Update Successful
        }).catch(function(error){
          //Error
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "https://cdn.jsdelivr.net/npm/animate.css@3.5.1";
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"; 
  input {
    width: 100%;
    border: 0;
    padding: 5px;
    font-size: 1.3em;
    background-color: #323333;
    color: #687F7F;
  }
.holder {
  padding: 5em;
    background: #fff;
  }
.username{
  display: inline-flex;

}
  .account{
    height: 2000px;
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
