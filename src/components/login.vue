<template class="login">
  <div v-if="login==1">
    <h3><img class="d-inline-block" v-bind:src="require('../assets/menu.png')" width="30" height="30"/> Login<br>
    </h3>
    <input class="mdl-textfield__input" style="display:inline;width:auto;" type="text" v-model="email" placeholder="Email"/>
    &nbsp;&nbsp;&nbsp;
    <input class="mdl-textfield__input" style="display:inline;width:auto;" type="password" v-model="password" placeholder="Password"/><br>
    <b-button class="butt" :size="'sm'" :variant="'outline-success'" v-on:click="signIn">Sign In</b-button>
    <br>Don't have an account?
    <b-button class="butt" :size="'sm'" :variant="'outline-success'" v-on:click="login=2">Create Account</b-button>
    &nbsp;&nbsp;&nbsp;
  </div>
  <div v-else-if="login==2" class="login">
    <h3><img class="d-inline-block" v-bind:src="require('../assets/menu.png')" width="30" height="30"/> Sign Up<br>
    </h3>
    <input class="mdl-textfield__input" style="display:inline;width:auto;" type="text" v-model="name" placeholder="Name"/>
    &nbsp;&nbsp;&nbsp;
    <input class="mdl-textfield__input" style="display:inline;width:auto;" type="text" v-model="email" placeholder="Email"/>
    &nbsp;&nbsp;&nbsp;
    <input class="mdl-textfield__input" style="display:inline;width:auto;" type="password" v-model="password" placeholder="Password"/><br>
    <b-button class="butt" :size="'sm'" :variant="'outline-success'" v-on:click="handleSignUp">Create Account</b-button>
    &nbsp;&nbsp;&nbsp;
    <br>Already have an account?
    <b-button class="butt" :size="'sm'" :variant="'outline-success'" v-on:click="login=1">Sign In</b-button>
  </div>
  <div v-else>Hi, {{ email }} <b-button @click='signOut'>Sign out</b-button>
</div>
</template>

<script>
  import firebase from 'firebase'
  export default {
    name: 'login',
    data: function() {
      return {
        name: '',
        email: '',
        password: '',
        login: 1,
        Balance: ''
        }
    },
    beforeMount(){
      this.getUser();
    },  
    computed: {
      balance: function() {
        return this.Balance;
      }
    },
    methods: {
      signIn: function() {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
          (user) => {
            this.name = user.name;
            this.email = user.email;
          },
          (err) => {
            alert('Oops. ' + err.message)
          }
        );
      },
      signOut: function(){
        firebase.auth().signOut();
        this.login = 1;
        this.name = '';
        this.email = '';
      },
      handleSignUp: function() {
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
          (user) => {
            console.log(user.displayName)
          },
          (err) => {
            alert('Oops. ' + err.message)
          }
        )
      },
      update: function() {
        var user = firebase.auth().currentUser;
        user.updateProfile({
          displayName: this.name
        }).then(function(){
          this.name = user.name;
          this.email = user.email;})
        .catch(function(error){return error})
      },
      getUser: function() {
        var u = firebase.auth().currentUser;
        if(u != undefined){
          this.login = 0;
          this.email = u.email;
          this.name = u.name;
        }
        else
          this.user = 1;
      },
      getBalance: function(){
        var getBalance = firebase.functions().httpsCallable('getBalance');
        getBalance().then(result => {
          this.Balance = result.data;
        });
      }
    }
  }
</script>

<style scoped>  /* "scoped" attribute limit the CSS to this component only */
    .login{
    margin: 10%;
    background: #3233334c;
    width: 80%;
  }
    .butt{
      margin-top: 5px;
    }
.balance{
  color: green;
  -webkit-text-stroke-width: 0.04em;
}
  input {
    margin: 10px 0;
    width: 20%;
    padding: 15px;
  }
  button {
    margin-top: 20px;
    cursor: pointer;
  }
  p {
    margin-top: 40px;
    font-size: 13px;
  }
  p a {
    text-decoration: underline;
    cursor: pointer;
  }
</style>