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
    var amount = parseInt(document.getElementById(elementID).value);
    var userID = localStorage.getItem("userName");

    //reduce points from user  
    var userref = firebase.database().ref("/username/"+userID+"/balance");

    userref.once('value').then(function(snapshot) {
        balance = parseInt(snapshot.val().total);
        if(balance > amount){
            balance -= amount;
            userref.set({
                total : balance
            });
        }
        else{
            console.log("Not enough funds!");
        }
    }); 

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
        
    //records bet in user profile
    var betRef = firebase.database().ref("/username/"+userID+"/bets/"+tranKey);
    betRef.set({
        amount : amount,
        game : game
    });
    document.getElementById("balance").innerHTML = balance;


}


function gameover(game){
    var t1 = parseInt(document.getElementById("cavsScore").value);
    var t2 = parseInt(document.getElementById("warScore").value);
    var MLT1Odds;
    var MLT2Odds;
    var SprT1Odds;
    var SprT1Spr;
    var SprT2Spr;
    var SprT2Odds;
    var TOverOdds;
    var TUnderOdds;
    var profitML, profitSpr, profitTOU;

    //find out odds and spreads
    var oddsRef = firebase.database().ref("/Games/"+game+"/Pots");
    oddsRef.once('value', function(snapshot) {
            var counter = 0;
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                switch(counter){
                    case 0:
                            MLT1Odds = childData.odds;
                            counter++;
                            break;
                    case 1:
                            MLT2Odds = childData.odds;
                            counter++;
                            break;
                    case 2:
                            SprT1Odds = childData.odds;
                            SprT1Spr = childData.spread;
                            counter++;
                            break;
                    case 3:
                            SprT2Odds = childData.odds;
                            SprT1Spr = childData.spread;
                            counter++;
                            break;
                    case 4:
                            TOverOdds = childData.odds;
                            counter++;
                            break;
                    case 5:
                            TUnderOdds = childData.odds;
                            counter++;
                            break;
                    default:
                            console.log("Could determine pot for " + childData.key);
                            counter++;
                            break;
                }
            });
        });

    //allow for odds to be calculated then proceed
    setTimeout(function(){
        console.log(MLT2Odds);
        
        //settle moneyline
        //if Team1 > Team2
        if(t1 > t2)
        {
            //reference losing team to move pot to profits
            var losingRef1 = firebase.database().ref("/Games/"+game+"/Pots/MLT2/total");
            losingRef1.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT2 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef1.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            var profitRef1 = firebase.database().ref("/Games/"+game+"/profit/ML");
            var newProfit1 =0;
            profitRef1.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                newProfit1 = profitML + parseInt(childSnapshot.val());
                });
            });
            //set new Profit
            setTimeout(function(){
                console.log("newprofits1 = " + newProfit1);
                profitRef1.set({
                    total : newProfit1
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef1 = firebase.database().ref("/Games/"+game+"/Pots/MLT1/total");
            winningRef1.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT1 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef1.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var wprofitRef1 = firebase.database().ref("/Games/"+game+"/profit/ML");
                var newProfitw1 = profitML + newProfit1;
                //set new Profit
            
                console.log("newprofits2 = " + newProfitw1);
                wprofitRef1.set({
                    total : newProfitw1
                });
             },1000);
            //reference all the bets for this pot
            var ref1 = firebase.database().ref("/Games/"+game+"/Pots/MLT1/bets");
            ref1.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    console.log(transKey);
                    setTimeout(function(){
                        //payout to winner username
                        payout(username, MLT1Odds, amount, transKey,'MLT1',game);
                    },1000);
                });
            });
        }
        //else
        else
        {
            //reference losing team to move pot to profits
            var losingRef2 = firebase.database().ref("/Games/"+game+"/Pots/MLT1/total");
            losingRef2.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT1 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef2.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            var profitRef2 = firebase.database().ref("/Games/"+game+"/profit/ML");
            var newProfit2 =0;
            profitRef2.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    newProfit2 = profitML + parseInt(childSnapshot.val());
                    console.log("n = "+newProfit2);
                });
            });
            //set new profit
            setTimeout(function(){
                console.log("newprofits1 = " + newProfit2);
                profitRef2.set({
                    total : newProfit2
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef2 = firebase.database().ref("/Games/"+game+"/Pots/MLT2/total");
            winningRef2.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT2 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef2.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var wprofitRef2 = firebase.database().ref("/Games/"+game+"/profit/ML");
                var newProfitw2 = profitML + newProfit2;
                //set new Profit
            
                console.log("newprofits2 = " + newProfitw2);
                wprofitRef2.set({
                    total : newProfitw2
                });
             },1000);
            //reference all the bets for this pot
            var ref2 = firebase.database().ref("/Games/"+game+"/Pots/MLT2/bets");
            ref2.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    console.log(transKey);
                    setTimeout(function(){
                        //payout to winner username
                        payout(username, MLT2Odds, amount, transKey,'MLT2',game);
                    },1000);
                });
            });
        }
        //settle spread
        //if Team1+Spr > Team2
        if((t1 + SprT1Spr) > (t2))
        {
            //reference losing team to move pot to profits
            var losingRef3 = firebase.database().ref("/Games/"+game+"/Pots/SprT2/total");
            losingRef3.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT2 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef3.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            var profitRef3 = firebase.database().ref("/Games/"+game+"/profit/Spr");
            var newProfit3 =0;
            profitRef3.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                newProfit3 = profitSpr + parseInt(childSnapshot.val());
                });
            });
            //set new profit
            setTimeout(function(){
                profitRef3.set({
                    total : newProfit3
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef3 = firebase.database().ref("/Games/"+game+"/Pots/SprT1/total");
            winningRef3.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT1 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef3.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var wprofitRef3 = firebase.database().ref("/Games/"+game+"/profit/Spr");
                var newProfitw3 = profitSpr + newProfit3;
                
                //set new profit
            
                wprofitRef3.set({
                    total : newProfitw3
                });
            },1000);
            //reference all the bets for this pot and pay them out
            var ref = firebase.database().ref("/Games/"+game+"/Pots/SprT1/bets");
            ref.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function(){    
                        //payout to winner username
                        payout(username, SprT1Odds, amount, transKey,'SprT1',game);
                    },1000);
                });
            });
        }
        
        //else
        else
        {
            //reference losing team to move pot to profits
            var losingRef4 = firebase.database().ref("/Games/"+game+"/Pots/SprT1/total");
            losingRef4.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT1 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef4.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var profitRef4 = firebase.database().ref("/Games/"+game+"/profit/Spr");
                var newProfit4 = profitSpr + newProfit4;
                //set new profit
            
                profitRef4.set({
                    total : newProfit4
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef4 = firebase.database().ref("/Games/"+game+"/Pots/SprT2/total");
            winningRef4.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT2 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef4.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            setTimeout(function(){
                var wprofitRef4 = firebase.database().ref("/Games/"+game+"/profit/Spr");
                var newProfitw4 = profitSpr + newProfitw4;
                //set new profit
            
                wprofitRef4.set({
                    total : newProfitw4
                });
            },1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/"+game+"/Pots/SprT2/bets");
            ref.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function(){ 
                        //payout to winner username
                        payout(username, SprT2Odds, amount, transKey,'SprT2',game);
                    },1000);
                });
            });
        }
        //settle total
        //if team1 + team2 < 216.5
        if((t1+t2) < 216.5)
        {
            //reference losing team to move pot to profits
            var losingRef5 = firebase.database().ref("/Games/"+game+"/Pots/TOver/total");
            losingRef5.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTOver = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef5.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            var profitRef5 = firebase.database().ref("/Games/"+game+"/profit/TOU");
            var newProfit5 =0;
            profitRef5.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                newProfit5 = profitTOU + parseInt(childSnapshot.val());
                });
            });
            //set new profit
            setTimeout(function(){
                profitRef5.set({
                    total : newProfit5
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef5 = firebase.database().ref("/Games/"+game+"/Pots/TUnder/total");
            winningRef5.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTUnder = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef5.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var wprofitRef5 = firebase.database().ref("/Games/"+game+"/profit/TOU");
                var newProfitw5 = profitTOU + newProfit5;

                //set new profit
            
                wprofitRef5.set({
                    total : newProfitw5
                });
            },1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/"+game+"/Pots/TUnder/bets");
            ref.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function(){
                        //payout to winner username
                        payout(username, TUnderOdds, amount, transKey,'TUnder',game);
                    },1000);
                });
            });
        }
        //else
        else
        {
            //reference losing team to move pot to profits
            var losingRef6 = firebase.database().ref("/Games/"+game+"/Pots/TUnder/total");
            losingRef6.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTUnder = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function(){
                losingRef6.set({
                    pot : 0,
                });
            },1000);
            //reference the profit
            var profitRef6 = firebase.database().ref("/Games/"+game+"/profit/TOU");
            var newProfit6 = 0;
            profitRef6.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                newProfit6 = profitTOU + parseInt(childSnapshot.val());
            });
        });
            //set new profit
            setTimeout(function(){
                profitRef6.set({
                    total : newProfit6
                });
            },1000);
            //reference WINNING team to move pot to profits
            var winningRef6 = firebase.database().ref("/Games/"+game+"/Pots/TOver/total");
            winningRef6.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTOver = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function(){
                winningRef6.set({
                    pot : 0,
                });
            },1000);
            setTimeout(function(){
                //reference the profit
                var wprofitRef6 = firebase.database().ref("/Games/"+game+"/profit/TOU");
                var newProfitw6 = profitTOU + newProfit6;

                //set new profit
            
                wprofitRef6.set({
                    total : newProfitw6
                });
            },1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/"+game+"/Pots/TOver/bets");
            ref.once('value', function(snapshot) {
                setTimeout(function(){
                snapshot.forEach(function(childSnapshot) {
                    
                        var childData = childSnapshot.val();
                        var username = childData.username;
                        var amount = childData.amount;
                        var transKey = childSnapshot.key;
                    
                        //payout to winner username
                        payout(username, TOverOdds, amount, transKey,'TOver',game);
                });
                },2000);
            });
        }
    },1000);
}

function payout(username, odds, amount, key, type, game){
    //calculate payout
    var payment;
    odds = parseInt(odds);
    if(odds>0)
        payment = amount * ((odds/100)+1);
    else
        payment = amount * ((100/(-1*odds))+1);
    switch(type){
        case "MLT1":
        case "MLT2":
            //Pay from pot of Moneyline
            var MLPotRef = firebase.database().ref("/Games/"+game+"/profit/ML");
            var MLTotal;
            MLPotRef.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    MLTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function(){
                //if we have enough in the pot to make the payment
                if(MLTotal >= payment)
                {
                    console.log("Paying ML from "+ MLTotal+" for $" + payment +" to " + username);
                    MLTotal -= payment;
                    console.log("MLTotal = "+ MLTotal);
                    MLPotRef.set({
                        total : MLTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    MLTotal -= payment;
                    MLPotRef.set({
                        total : MLTotal
                    });
                    console.log("Not enough money in ML pot to make payments of "+ payment);
                }
            },1000);
            break;
        case "SprT1": 
        case "SprT2":
            //Pay from pot of Spread
            var SprTotal;
            var SprPotRef = firebase.database().ref("/Games/"+game+"/profit/Spr");
            SprPotRef.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    SprTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function(){
                //if we have enough in the pot to make the payment
                if(SprTotal >= payment)
                {
                    console.log("Paying Spr from "+ SprTotal+" for $" + payment +" to " + username);
                    SprTotal -= payment;
                    console.log("SprTotal = "+ SprTotal);
                    SprPotRef.set({
                        total : SprTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    SprTotal -= payment;
                    SprPotRef.set({
                        total : SprTotal
                    });
                    console.log("Not enough money in Spr pot to make payments of "+ payment);
                }
            },1000);
            break;
        case "TOver":
        case "TUnder":
            //Pay from pot of Moneyline
            var TTotal;
            var TPotRef = firebase.database().ref("/Games/"+game+"/profit/TOU");
            TPotRef.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    TTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function(){
                //if we have enough in the pot to make the payment
                if(TTotal >= payment)
                {
                    console.log("Paying out TOU from "+ TTotal+" for $" + payment +" to " + username);
                    TTotal -= payment;
                    console.log("TTotal = "+ TTotal);
                    TPotRef.set({
                        total : TTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    console.log("Not enough money in TOU pot to make payment of " + payment);
                    TTotal -= payment;
                    TPotRef.set({
                        total : TTotal
                    });
                }
            },1000);
            break;
        default:
            console.log("couldn't determine type of bet");
            break;
    }
    var ref = firebase.database().ref("/username/"+username+"/payouts").push();
    ref.set({
            odds : odds,
            betAmount : amount,
            payment : payment,
            game : game,
            betType : type,
            betTransaction : key
    });

    //update balance
    var userref = firebase.database().ref("/username/"+username+"/balance");
    userref.once('value').then(function(snapshot) {
        balance = payment + parseInt(snapshot.val().total);
        userref.set({
            total : balance
        });
    });   
}

function changeML(game, t1, t2){
    //make tab active
    document.getElementById(game+"Tabs").innerHTML= '<li class="nav-item"><a class="nav-link active"  onclick="changeML(\''+game+'\',\''+t1+'\', \''+t2+'\');">Moneyline</a></li><li class="nav-item"><a class="nav-link"  onclick="changeOU(\''+game+'\',\''+t1+'\', \''+t2+'\');">Over/Under</a></li><li class="nav-item"><a class="nav-link"  onclick="changeSpr(\''+game+'\',\''+t1+'\', \''+t2+'\');">Spread</a></li>';
    //change buttons
    document.getElementById(game).innerHTML = '<div class="card-body col-6"><img src="'+findFlag(t1)+'" width="70" height="70" class="d-inline-block align-top" alt=""><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal5"><strong>-170</strong></div><div class="card-body col-6"><img src="'+findFlag(t2)+'" width="70" height="70" class="d-inline-block align-top" alt=""><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal6"><strong>+150</strong></div>';
}

function changeOU(game, t1, t2){
    //change active tabs
    document.getElementById(game+"Tabs").innerHTML= '<li class="nav-item"><a class="nav-link"  onclick="changeML(\''+game+'\',\''+t1+'\', \''+t2+'\');">Moneyline</a></li><li class="nav-item"><a class="nav-link active"  onclick="changeOU(\''+game+'\',\''+t1+'\', \''+t2+'\');">Over/Under</a></li><li class="nav-item"><a class="nav-link"  onclick="changeSpr(\''+game+'\',\''+t1+'\', \''+t2+'\');">Spread</a></li>';
    //change buttons
    document.getElementById(game).innerHTML = '<div class = "container"><strong>3.5 Total Goals</strong></div><div class="card-body col-6"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal3"><strong>Over<br>-110</strong></div><div class="card-body col-6"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal4"><strong>Under <br>-110</strong></div>';
}

function changeSpr(game, t1, t2){
    document.getElementById(game+"Tabs").innerHTML= '<li class="nav-item"><a class="nav-link"  onclick="changeML(\''+game+'\',\''+t1+'\', \''+t2+'\');">Moneyline</a></li><li class="nav-item"><a class="nav-link"  onclick="changeOU(\''+game+'\',\''+t1+'\', \''+t2+'\');">Over/Under</a></li><li class="nav-item"><a class="nav-link active"  onclick="changeSpr(\''+game+'\',\''+t1+'\', \''+t2+'\');">Spread</a></li>';

    //change buttons
    document.getElementById(game).innerHTML = '<div class="card-body col-6"><img src="'+findFlag(t1)+'" width="70" height="70" class="d-inline-block align-top" alt=""><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1"><strong>+1.5<br>-170</strong></div><div class="card-body col-6"><img src="'+findFlag(t2)+'" width="70" height="70" class="d-inline-block align-top" alt=""><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal2"><strong>-1.5<br>+150</strong></div>';
}

function findFlag(t){
    switch(t){
        case 'Urg' : 
            return "Pics/uruguayFlag.png";
        case 'Port':
            return "Pics/portugalFlag.png";
        case 'Cro':
            return "Pics/croatiaFlag.png";
        case 'Den':
            return "Pics/denmarkFlag.png";
        case 'Arg':
            return "Pics/argentinaFlag.png";
        case 'Fra':
            return "Pics/franceFlag.png";
        case 'Mex':
            return "Pics/mexicoFlag.png";
        case 'Rus':
            return "Pics/russiaFlag.svg";
        case 'Spa':
            return "Pics/spainFlag.png";
        case 'Swe':
            return "Pics/swedenFlag.svg";
        default:
            break;

    }
}

/*function showBet(game, type, t1, t2){
    document.getElementById("betModal").innerHTML = 

    <div class="modal fade" id="betModal1" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Bet Preview (Spread)</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="input-group input-group-sm mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text">Bet Amount</span>
                </div>
                <input type="text" class="form-control" id="betAmount1" aria-label="Small" aria-describedby="inputGroup-sizing-sm">
              </div>
              Spread +4.5 to win (-110)
              <br> $100 bet gets you $190.91.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="bet('SprT1','00001','betAmount1');">Bet Now!</button>
            </div>
          </div>
        </div>
      </div>
}*/