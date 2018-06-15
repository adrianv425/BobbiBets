/*

*/

function loginButton(){
    var u;
    if((u = localStorage.getItem("userName"))!=null){
        document.getElementById("loginButton").innerHTML = "Hi, "+ u;
        document.getElementById("loginButton").disabled = true;
        var ref = firebase.database().ref("/username/"+u+"/balance");
        ref.once("value").then(function(snapshot){
            var val = snapshot.val().total;
            document.getElementById("balance").innerHTML = "Balance: " + val;
        });
    }
}
function login(){
    var userName = document.getElementById("userName").value;
    localStorage.setItem("userName", userName);
    var firebaseD = firebase.database();
    var data = firebase.database().ref("/username/"+userName);
    data.set({
        balance : {total : 5000},
        bets : 0
    });
    document.getElementById("loginButton").innerHTML = "Hi, "+userName;
    document.getElementById("loginButton").disabled = true;
    document.getElementById("balance").innerHTML = 5000;
}

function bet(type, game, elementID)
{
    var pot;
    var total;
    var ref1;
    var ref2;
    var balance;
    var tranKey;
    var amount = document.getElementById(elementID).value;
    var userID = localStorage.getItem("userName");

        //Add points to pot of type
        ref1 = firebase.database().ref("/Games/"+game+"/Pots/"+type+"/total");
        ref1.once('value').then(function(snapshot) {
        pot = snapshot.val().pot;
        // ...;
        console.log(pot);
        total = pot + parseInt(document.getElementById(elementID).value);
        ref1.set({
            pot : total,
        });
        });
        //add to running total on the pot
        ref2 = firebase.database().ref("/Games/"+game+"/Pots/"+type+"/bets").push();
        tranKey = ref2.key;
        ref2.set({
            username : userID,
            amount : amount
        });
        //reduce points from user  
        var userref = firebase.database().ref("/username/"+userID+"/balance");

        userref.once('value').then(function(snapshot) {
            balance = parseInt(snapshot.val().total);
            balance -= parseInt(document.getElementById(elementID).value);
            userref.set({
            total : balance
            });
        });   
        //records bet in user profile
        var betRef = firebase.database().ref("/username/"+userID+"/bets/"+tranKey);
        betRef.set({
            amount : amount,
            game : game
        });
        document.getElementById("balance").innerHTML = balance;


}


function gameover(){
    var t1 = document.getElementById("cavsScore").value;
    var t2 = document.getElementById("warScore").value;
    //settle moneyline
    //if Team1 > Team2
    if(t1 > t2)
    {
        ref = firebase.database().ref("/Games/00001/Pots/MLT1/bets");
        ref.once('value').then(function(snapshot) {
            var b = snapshot.val();
            console.log();
        });
        //ref1.once('value').then(function(snapshot) {
            //pot = snapshot.val().pot;
    }
    //else

    //settle spread
    //if Team1+Spr > Team2
    
    //else

    //settle total
    //if team1 + team2 > 216.5
    
    //else
}