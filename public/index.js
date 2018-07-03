/*

*/

function loginButton() {
    var u;
    if ((u = localStorage.getItem("userName")) != null) {
        document.getElementById("loginButton").innerHTML = "Hi, " + u;
        document.getElementById("loginButton").disabled = true;
        var ref = firebase.database().ref("/username/" + u + "/balance");
        ref.once("value").then(function (snapshot) {
            var val = snapshot.val().total;
            document.getElementById("balance").innerHTML = "Balance: " + val;
        });
    }
}
function login() {
    var userName = document.getElementById("userName").value;
    localStorage.setItem("userName", userName);
    var firebaseD = firebase.database();
    var data = firebase.database().ref("/username/" + userName);
    data.set({
        balance: { total: 5000 },
        bets: 0
    });
    document.getElementById("loginButton").innerHTML = "Hi, " + userName;
    document.getElementById("loginButton").disabled = true;
    document.getElementById("balance").innerHTML = 5000;
}

function letsee(p) {
    setInterval(function () {
        var d = new Date();
        var ref = firebase.database().ref("/Games/" + p);
        ref.once("value").then(function (snapshot) {
            var val = new Date(snapshot.val().date);
            var cardTitle = snapshot.val().cardTitle;
            var flag1 = snapshot.val().flag1;
            var flag2 = snapshot.val().flag2;
            var team1 = snapshot.val().team1;
            var team2 = snapshot.val().team2;
            var date = new Date(snapshot.val().date);
            var gameID = snapshot.val().gameID;

            if (('Invalid Date' == val) || (d < val)) {
                document.getElementById(p + 'x').innerHTML = '<br><div class="card text-center">' + cardTitle + '<div class="card-header"><Strong><img src="' + flag1 + '" width="20" height="20" class="d-inline-block align-top" alt=""> ' + team1 + ' vs. ' + team2 + ' <img src="' + flag2 + '" width="20" height="20" class="d-inline-block align-top" alt=""></Strong><div class = "col"><p>' + date.toLocaleString() + '</p></div><ul class="nav nav-tabs card-header-tabs" id="' + gameID + 'Tabs"><li class="nav-item"><a class="nav-link"onclick="changeML(\'' + gameID + '\');">Moneyline</a></li><li class="nav-item"><a class="nav-link"onclick="changeOU(\'' + gameID + '\');">Over/Under</a></li><li class="nav-item"><a class="nav-link"onclick="changeSpr(\'' + gameID + '\');">Spread</a></li></ul></div><div class="row" id="' + gameID + '"></div></div></div>';
            }
        });
    }, 5000);
}

function wc() {
    setInterval(function(){
        var doc = '';
        var ref = firebase.database().ref("Games/wcwinner/Pots");
        ref.once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {

            var odds = parseInt(childSnapshot.val().odds);
            if (odds != 0) {
                var team = childSnapshot.val().team;
                var flag = childSnapshot.val().flag;

                doc += '<Strong><img src="' + flag + '" width="20" height="20" class="d-inline-block align-top" alt=""data-toggle="modal" data-target="#betModal1"onclick="showBet(\'wcwinner\',\'' + capFLetter(team) + '\');"> ' + team + '</Strong><tab1><tab1></tab1></tab1><button class = "btn btn-sm"data-toggle="modal" data-target="#betModal1"onclick="showBet(\'wcwinner\',\'' + capFLetter(team) + '\');">' + plus(odds) + '</button><br>';
            }
        });
        document.getElementById("wc").innerHTML = doc;
    });
},5000);
}

function capFLetter2(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capFLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function bet(type, game, elementID) {
    var pot;
    var total;
    var ref1;
    var ref2;
    var balance;
    var tranKey;
    var amount = parseInt(document.getElementById(elementID).value);
    var userID = localStorage.getItem("userName");

    //reduce points from user  
    var userref = firebase.database().ref("/username/" + userID + "/balance");

    userref.once('value').then(function (snapshot) {
        balance = parseInt(snapshot.val().total);
        if (amount < 0) {
            console.log("Negative input");
            var alert = document.getElementById("modalFooter").innerHTML;
            document.getElementById("modalFooter").innerHTML = "Please enter a positive input." + alert;
            return 0;
        }
        else if (balance > amount) {
            balance -= amount;
            userref.set({
                total: balance
            });
        }
        else {
            console.log("Not enough funds!");
            var alert = document.getElementById("modalFooter").innerHTML;
            document.getElementById("modalFooter").innerHTML = "Not enough funds!" + alert;
            return 0;
        }


        //Add points to pot of type
        ref1 = firebase.database().ref("/Games/" + game + "/Pots/" + type);
        ref1.once('value').then(function (snapshot) {
            pot = snapshot.val().total;
            // ...;
            console.log(pot);
            total = pot + parseInt(document.getElementById(elementID).value);

            var updates = {};
            updates["/Games/" + game + "/Pots/" + type + "/total"] = total;

            firebase.database().ref().update(updates);
        });

        var oddsref = firebase.database().ref("/Games/" + game + "/Pots/" + type);

        oddsref.once('value').then(function (snapshot) {
            var odds = parseInt(snapshot.val().odds);

            //add to running total on the pot
            ref2 = firebase.database().ref("/Games/" + game + "/Pots/" + type + "/bets").push();
            tranKey = ref2.key;
            ref2.set({
                username: userID,
                amount: amount,
                odds: odds
            });

            //records bet in user profile
            var betRef = firebase.database().ref("/username/" + userID + "/bets/" + tranKey);
            betRef.set({
                amount: amount,
                type: type,
                game: game,
                status: "pending result",
                odds: odds
            });
            document.getElementById("balance").innerHTML = balance;
        });
    });

}

function displayBets() {
    var u;
    var body = document.getElementById("betDisplay").innerHTML;

    if ((u = localStorage.getItem("userName")) != null) {
        var ref = firebase.database().ref("/username/" + u + "/bets");
        ref.once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var amount = parseInt(childSnapshot.val().amount);
                var type = childSnapshot.val().type;
                var game = childSnapshot.val().game;
                var status = childSnapshot.val().status;
                var ref = firebase.database().ref("/Games/" + game);
                ref.once("value").then(function (snapshot2) {

                    var t1 = snapshot2.val().t1;

                    var t2 = snapshot2.val().t2;

                    body = '<div class="container" id="bet0">' + betFor(type, game) + '<div class="row"><div class="col-8" id="myBetTeams"><h5 class="display-10">' + t1 + '<br></tab1></h5><h5>' + t2 + '</h5></div><div class="col-4">$' + amount + '<br>status: ' + status + '</div></div></div><br>' + body;
                    document.getElementById("betDisplay").innerHTML = body;
                });
            });
        });
    }
    else {
        document.getElementById("betDisplay").innerHTML = "Please log in.";
    }
}


function gameover() {
    var t1 = parseFloat(document.getElementById("t1score").value);
    var t2 = parseFloat(document.getElementById("t2score").value);
    var game = document.getElementById("gameID").value;
    var MLT1Odds;
    var MLT2Odds;
    var SprT1Odds;
    var SprT1Spr;
    var SprT2Odds;
    var total;
    var TOverOdds;
    var TUnderOdds;
    var profitML, profitSpr, profitTOU;

    //find out odds and spreads
    var oddsRef = firebase.database().ref("/Games/" + game + "/Pots");
    oddsRef.once('value', function (snapshot) {
        var counter = 0;
        snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            switch (counter) {
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
                    total = childData.prediction;
                    counter++;
                    break;
                case 5:
                    TUnderOdds = childData.odds;
                    total = childData.prediction;
                    counter++;
                    break;
                default:
                    console.log("Couldn't determine pot for " + childData.key);
                    counter++;
                    break;
            }
        });
    });

    //allow for odds to be calculated then proceed
    setTimeout(function () {
        console.log(MLT2Odds);

        //settle moneyline
        //if Team1 > Team2
        if (t1 > t2) {
            //reference losing team to move pot to profits
            var losingRef1 = firebase.database().ref("/Games/" + game + "/Pots/MLT2/total");
            losingRef1.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT2 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef1.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            var profitRef1 = firebase.database().ref("/Games/" + game + "/profit/ML");
            var newProfit1 = 0;
            profitRef1.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    newProfit1 = profitML + parseInt(childSnapshot.val());
                });
            });
            //set new Profit
            setTimeout(function () {
                console.log("newprofits1 = " + newProfit1);
                profitRef1.set({
                    total: newProfit1
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef1 = firebase.database().ref("/Games/" + game + "/Pots/MLT1/total");
            winningRef1.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT1 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef1.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var wprofitRef1 = firebase.database().ref("/Games/" + game + "/profit/ML");
                var newProfitw1 = profitML + newProfit1;
                //set new Profit

                console.log("newprofits2 = " + newProfitw1);
                wprofitRef1.set({
                    total: newProfitw1
                });
            }, 1000);
            //reference all the bets for this pot
            var ref1 = firebase.database().ref("/Games/" + game + "/Pots/MLT1/bets");
            ref1.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    console.log(transKey);
                    setTimeout(function () {
                        //payout to winner username
                        payout(username, MLT1Odds, amount, transKey, 'MLT1', game);
                    }, 1000);
                });
            });
        }
        //else
        else {
            //reference losing team to move pot to profits
            var losingRef2 = firebase.database().ref("/Games/" + game + "/Pots/MLT1/total");
            losingRef2.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT1 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef2.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            var profitRef2 = firebase.database().ref("/Games/" + game + "/profit/ML");
            var newProfit2 = 0;
            profitRef2.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    newProfit2 = profitML + parseInt(childSnapshot.val());
                    console.log("n = " + newProfit2);
                });
            });
            //set new profit
            setTimeout(function () {
                console.log("newprofits1 = " + newProfit2);
                profitRef2.set({
                    total: newProfit2
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef2 = firebase.database().ref("/Games/" + game + "/Pots/MLT2/total");
            winningRef2.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitML = parseInt(childSnapshot.val());
                    console.log("profitMLT2 = " + profitML);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef2.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var wprofitRef2 = firebase.database().ref("/Games/" + game + "/profit/ML");
                var newProfitw2 = profitML + newProfit2;
                //set new Profit

                console.log("newprofits2 = " + newProfitw2);
                wprofitRef2.set({
                    total: newProfitw2
                });
            }, 1000);
            //reference all the bets for this pot
            var ref2 = firebase.database().ref("/Games/" + game + "/Pots/MLT2/bets");
            ref2.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    console.log(transKey);
                    setTimeout(function () {
                        //payout to winner username
                        payout(username, MLT2Odds, amount, transKey, 'MLT2', game);
                    }, 1000);
                });
            });
        }
        //settle spread
        //if Team1+Spr > Team2
        if ((t1 + SprT1Spr) > (t2)) {
            //reference losing team to move pot to profits
            var losingRef3 = firebase.database().ref("/Games/" + game + "/Pots/SprT2/total");
            losingRef3.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT2 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef3.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            var profitRef3 = firebase.database().ref("/Games/" + game + "/profit/Spr");
            var newProfit3 = 0;
            profitRef3.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    newProfit3 = profitSpr + parseInt(childSnapshot.val());
                });
            });
            //set new profit
            setTimeout(function () {
                profitRef3.set({
                    total: newProfit3
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef3 = firebase.database().ref("/Games/" + game + "/Pots/SprT1/total");
            winningRef3.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT1 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef3.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var wprofitRef3 = firebase.database().ref("/Games/" + game + "/profit/Spr");
                var newProfitw3 = profitSpr + newProfit3;

                //set new profit

                wprofitRef3.set({
                    total: newProfitw3
                });
            }, 1000);
            //reference all the bets for this pot and pay them out
            var ref = firebase.database().ref("/Games/" + game + "/Pots/SprT1/bets");
            ref.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function () {
                        //payout to winner username
                        payout(username, SprT1Odds, amount, transKey, 'SprT1', game);
                    }, 1000);
                });
            });
        }

        //else
        else {
            //reference losing team to move pot to profits
            var losingRef4 = firebase.database().ref("/Games/" + game + "/Pots/SprT1/total");
            losingRef4.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT1 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef4.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var profitRef4 = firebase.database().ref("/Games/" + game + "/profit/Spr");
                var newProfit4 = 0;
                profitRef4.once('value', function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        newProfit4 = profitSpr + parseInt(childSnapshot.val());
                    });
                });
                //set new profit

                profitRef4.set({
                    total: newProfit4
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef4 = firebase.database().ref("/Games/" + game + "/Pots/SprT2/total");
            winningRef4.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitSpr = parseInt(childSnapshot.val());
                    console.log("profitSprT2 = " + profitSpr);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef4.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            setTimeout(function () {
                var wprofitRef4 = firebase.database().ref("/Games/" + game + "/profit/Spr");
                var newProfitw4 = profitSpr + newProfit4;
                //set new profit

                wprofitRef4.set({
                    total: newProfitw4
                });
            }, 1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/" + game + "/Pots/SprT2/bets");
            ref.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function () {
                        //payout to winner username
                        payout(username, SprT2Odds, amount, transKey, 'SprT2', game);
                    }, 1000);
                });
            });
        }
        //settle total
        //if team1 + team2 < 216.5
        if ((t1 + t2) < total) {
            //reference losing team to move pot to profits
            var losingRef5 = firebase.database().ref("/Games/" + game + "/Pots/TOver/total");
            losingRef5.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTOver = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef5.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            var profitRef5 = firebase.database().ref("/Games/" + game + "/profit/TOU");
            var newProfit5 = 0;
            profitRef5.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    newProfit5 = profitTOU + parseInt(childSnapshot.val());
                });
            });
            //set new profit
            setTimeout(function () {
                profitRef5.set({
                    total: newProfit5
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef5 = firebase.database().ref("/Games/" + game + "/Pots/TUnder/total");
            winningRef5.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTUnder = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef5.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var wprofitRef5 = firebase.database().ref("/Games/" + game + "/profit/TOU");
                var newProfitw5 = profitTOU + newProfit5;

                //set new profit

                wprofitRef5.set({
                    total: newProfitw5
                });
            }, 1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/" + game + "/Pots/TUnder/bets");
            ref.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childData = childSnapshot.val();
                    var username = childData.username;
                    var amount = childData.amount;
                    var transKey = childSnapshot.key;
                    setTimeout(function () {
                        //payout to winner username
                        payout(username, TUnderOdds, amount, transKey, 'TUnder', game);
                    }, 1000);
                });
            });
        }
        //else
        else {
            //reference losing team to move pot to profits
            var losingRef6 = firebase.database().ref("/Games/" + game + "/Pots/TUnder/total");
            losingRef6.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTUnder = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function () {
                losingRef6.set({
                    pot: 0,
                });
            }, 1000);
            //reference the profit
            var profitRef6 = firebase.database().ref("/Games/" + game + "/profit/TOU");
            var newProfit6 = 0;
            profitRef6.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    newProfit6 = profitTOU + parseInt(childSnapshot.val());
                });
            });
            //set new profit
            setTimeout(function () {
                profitRef6.set({
                    total: newProfit6
                });
            }, 1000);
            //reference WINNING team to move pot to profits
            var winningRef6 = firebase.database().ref("/Games/" + game + "/Pots/TOver/total");
            winningRef6.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    profitTOU = parseInt(childSnapshot.val());
                    console.log("profitTOver = " + profitTOU);
                });
            });
            //reset pot
            setTimeout(function () {
                winningRef6.set({
                    pot: 0,
                });
            }, 1000);
            setTimeout(function () {
                //reference the profit
                var wprofitRef6 = firebase.database().ref("/Games/" + game + "/profit/TOU");
                var newProfitw6 = profitTOU + newProfit6;

                //set new profit

                wprofitRef6.set({
                    total: newProfitw6
                });
            }, 1000);
            //reference all the bets for this pot
            var ref = firebase.database().ref("/Games/" + game + "/Pots/TOver/bets");
            ref.once('value', function (snapshot) {
                setTimeout(function () {
                    snapshot.forEach(function (childSnapshot) {

                        var childData = childSnapshot.val();
                        var username = childData.username;
                        var amount = childData.amount;
                        var transKey = childSnapshot.key;

                        //payout to winner username
                        payout(username, TOverOdds, amount, transKey, 'TOver', game);
                    });
                }, 2000);
            });
        }
    }, 1000);
}

function payout(username, odds, amount, key, type, game) {
    //calculate payout
    var payment;
    odds = parseInt(odds);
    if (odds > 0)
        payment = amount * ((odds / 100) + 1);
    else
        payment = amount * ((100 / (-1 * odds)) + 1);
    switch (type) {
        case "MLT1":
        case "MLT2":
            //Pay from pot of Moneyline
            var MLPotRef = firebase.database().ref("/Games/" + game + "/profit/ML");
            var MLTotal;
            MLPotRef.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    MLTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function () {
                //if we have enough in the pot to make the payment
                if (MLTotal >= payment) {
                    console.log("Paying ML from " + MLTotal + " for $" + payment + " to " + username);
                    MLTotal -= payment;
                    console.log("MLTotal = " + MLTotal);
                    MLPotRef.set({
                        total: MLTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    MLTotal -= payment;
                    MLPotRef.set({
                        total: MLTotal
                    });
                    console.log("Not enough money in ML pot to make payments of " + payment);
                }
            }, 1000);
            break;
        case "SprT1":
        case "SprT2":
            //Pay from pot of Spread
            var SprTotal;
            var SprPotRef = firebase.database().ref("/Games/" + game + "/profit/Spr");
            SprPotRef.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    SprTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function () {
                //if we have enough in the pot to make the payment
                if (SprTotal >= payment) {
                    console.log("Paying Spr from " + SprTotal + " for $" + payment + " to " + username);
                    SprTotal -= payment;
                    console.log("SprTotal = " + SprTotal);
                    SprPotRef.set({
                        total: SprTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    SprTotal -= payment;
                    SprPotRef.set({
                        total: SprTotal
                    });
                    console.log("Not enough money in Spr pot to make payments of " + payment);
                }
            }, 1000);
            break;
        case "TOver":
        case "TUnder":
            //Pay from pot of Moneyline
            var TTotal;
            var TPotRef = firebase.database().ref("/Games/" + game + "/profit/TOU");
            TPotRef.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    TTotal = parseInt(childSnapshot.val());
                });
            });
            setTimeout(function () {
                //if we have enough in the pot to make the payment
                if (TTotal >= payment) {
                    console.log("Paying out TOU from " + TTotal + " for $" + payment + " to " + username);
                    TTotal -= payment;
                    console.log("TTotal = " + TTotal);
                    TPotRef.set({
                        total: TTotal
                    });
                }
                else //else will need more money to pay winners
                {
                    console.log("Not enough money in TOU pot to make payment of " + payment);
                    TTotal -= payment;
                    TPotRef.set({
                        total: TTotal
                    });
                }
            }, 1000);
            break;
        default:
            console.log("couldn't determine type of bet");
            break;
    }
    var ref = firebase.database().ref("/username/" + username + "/payouts").push();
    ref.set({
        odds: odds,
        betAmount: amount,
        payment: payment,
        game: game,
        betType: type,
        betTransaction: key,
        payoutKey: ref.key
    });

    //update balance
    var userref = firebase.database().ref("/username/" + username + "/balance");
    userref.once('value').then(function (snapshot) {
        balance = payment + parseInt(snapshot.val().total);
        userref.set({
            total: balance
        });
    });
}

function changeML(game, x, y) {
    var ref1 = firebase.database().ref("Games/" + game + "/Pots/MLT1");
    var ref2 = firebase.database().ref("Games/" + game + "/Pots/MLT2");
    var teamRef = firebase.database().ref("Games/" + game);
    var t1;
    var t2;
    var flag1;
    var flag2;


    teamRef.once('value').then(function (snapshot1) {
        t1 = snapshot1.val().team1;
        flag1 = snapshot1.val().flag1;
        t2 = snapshot1.val().team2;
        flag2 = snapshot1.val().flag2;


        ref1.once('value').then(function (snapshot) {
            odds1 = parseFloat(snapshot.val().odds);
            ref2.once('value').then(function (snapshot) {
                odds2 = parseFloat(snapshot.val().odds);
                //make tab active
                document.getElementById(game + "Tabs").innerHTML = '<li class="nav-item"><a class="nav-link active"  onclick="changeML(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Moneyline</a></li><li class="nav-item"><a class="nav-link"  onclick="changeOU(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Over/Under</a></li><li class="nav-item"><a class="nav-link"  onclick="changeSpr(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Spread</a></li>';
                //change buttons
                document.getElementById(game).innerHTML = '<div class="card-body col-6"><img src="' + flag1 + '" width="70" height="70" class="d-inline-block align-top" alt=""data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'MLT1\', \'' + t1 + '\', \'' + t2 + '\');"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'MLT1\', \'' + t1 + '\', \'' + t2 + '\');"><strong>' + plus(odds1) + '</strong></div><div class="card-body col-6"><img src="' + flag2 + '" width="70" height="70" class="d-inline-block align-top" alt=""data-toggle="modal" data-target="#betModal1" onclick="showBet(\'' + game + '\',\'MLT2\', \'' + t2 + '\', \'' + t1 + '\');"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1" onclick="showBet(\'' + game + '\',\'MLT2\', \'' + t2 + '\', \'' + t1 + '\');"><strong>' + plus(odds2) + '</strong>';
            });
        });
    });
}

function changeOU(game, x, y) {
    var ref1 = firebase.database().ref("Games/" + game + "/Pots/TOver");
    var ref2 = firebase.database().ref("Games/" + game + "/Pots/TUnder");
    var odds1;
    var odds2;
    var teamRef = firebase.database().ref("Games/" + game);
    var t1;
    var t2;

    teamRef.once('value').then(function (snapshot1) {
        t1 = snapshot1.val().team1;
        t2 = snapshot1.val().team2;

        ref1.once('value').then(function (snapshot) {
            odds1 = parseFloat(snapshot.val().odds);
            pred = parseFloat(snapshot.val().prediction)
            ref2.once('value').then(function (snapshot) {
                odds2 = parseFloat(snapshot.val().odds);
                //change active tabs
                document.getElementById(game + "Tabs").innerHTML = '<li class="nav-item"><a class="nav-link"  onclick="changeML(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Moneyline</a></li><li class="nav-item"><a class="nav-link active"  onclick="changeOU(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Over/Under</a></li><li class="nav-item"><a class="nav-link"  onclick="changeSpr(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Spread</a></li>';
                //change buttons
                document.getElementById(game).innerHTML = '<div class = "container"><strong>' + pred + ' Total Score</strong></div><div class="card-body col-6"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1" onclick="showBet(\'' + game + '\',\'TOver\', \'' + t1 + '\', \'' + t2 + '\');"><strong>Over<br>' + plus(odds1) + '</strong></div><div class="card-body col-6"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'TUnder\', \'' + t1 + '\', \'' + t2 + '\');"><strong>Under <br>' + plus(odds2) + '</strong></div>';
            });
        });
    });
}

function changeSpr(game, x, y) {
    var ref1 = firebase.database().ref("Games/" + game + "/Pots/SprT1");
    var ref2 = firebase.database().ref("Games/" + game + "/Pots/SprT2");
    var spr1;
    var odds1;
    var spr2;
    var odds2;
    var teamRef = firebase.database().ref("Games/" + game);
    var t1;
    var t2;
    var flag1;
    var flag2;


    teamRef.once('value').then(function (snapshot1) {
        t1 = snapshot1.val().team1;
        flag1 = snapshot1.val().flag1;
        t2 = snapshot1.val().team2;
        flag2 = snapshot1.val().flag2;

        ref1.once('value').then(function (snapshot) {
            odds1 = parseFloat(snapshot.val().odds);
            spr1 = parseFloat(snapshot.val().spread)
            ref2.once('value').then(function (snapshot) {
                odds2 = parseFloat(snapshot.val().odds);
                spr2 = parseFloat(snapshot.val().spread)

                document.getElementById(game + "Tabs").innerHTML = '<li class="nav-item"><a class="nav-link"  onclick="changeML(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Moneyline</a></li><li class="nav-item"><a class="nav-link"  onclick="changeOU(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Over/Under</a></li><li class="nav-item"><a class="nav-link active"  onclick="changeSpr(\'' + game + '\',\'' + t1 + '\', \'' + t2 + '\');">Spread</a></li>';

                //change buttons
                document.getElementById(game).innerHTML = '<div class="card-body col-6"><img src="' + flag1 + '" width="70" height="70" class="d-inline-block align-top" alt=""data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'SprT1\', \'' + t1 + '\', \'' + t2 + '\');"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'SprT1\', \'' + t1 + '\', \'' + t2 + '\');"><strong>' + plus(spr1) + '<br>' + plus(odds1) + '</strong></div><div class="card-body col-6"><img src="' + flag2 + '" width="70" height="70" class="d-inline-block align-top" alt="" data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'SprT2\', \'' + t2 + '\', \'' + t1 + '\');"><button class="btn btn-light" style="color:#dd2228" data-toggle="modal" data-target="#betModal1"onclick="showBet(\'' + game + '\',\'SprT2\', \'' + t2 + '\', \'' + t1 + '\');"><strong>' + plus(spr2) + '<br>' + plus(odds2) + '</strong></div>';
            });
        });
    });
}

function name(t) {
    switch (t) {
        case 'Uru':
            return "Uruguay";
        case 'Port':
            return "Portugal";
        case 'Cro':
            return "Croatia";
        case 'Den':
            return "Denmark";
        case 'Arg':
            return "Argentina";
        case 'Fra':
            return "France";
        case 'Mex':
            return "Mexico";
        case 'Rus':
            return "Russia";
        case 'Spa':
            return "Spain";
        case 'Swe':
            return "Sweden";
        case 'Swi':
            return "Switzerland";
        case 'Bra':
            return "Brazil";
        case 'Bel':
            return "Belgium";
        case 'Jap':
            return "Japan";
        case 'Col':
            return "Colombia";
        case 'Eng':
            return "England";
        default:
            break;

    }
}

function betFor(t, game) {
    switch (t) {
        case 'uruguay':
        case 'portugal':
        case 'croatia':
        case 'denmark':
        case 'argentina':
        case 'france':
        case 'mexico':
        case 'russia':
        case 'spain':
        case 'sweden':
        case 'switerland':
        case 'brazil':
        case 'belgium':
        case 'japan':
        case 'colombia':
        case 'england':
            return 'You bet for ' + t + ' to win World Cup Russia 2018';
        default:
            return 'You bet : ' + t;
    }
}

/*function betDet(t, game){
    switch(t){
        case 'MLT1':
        case 'MLT2':
            return 'You are betting on '+ name(t1)+' to win '+ name(t2)+'.<br> ';
        case 'SprT1':
        case 'SprT2':
            return 'You are betting on ' +  name(t1) + ' to have more points than ' +  name(t2) + ' <strong> after applying '+ sp +' to ' +  name(t1) + '\'s final score.</strong>' ;
        case 'TOver':
            return 'You are betting that there will be more than ' + prediction + ' total goals in this match.';
        case 'TUnder':
            return 'You are betting that there will be less than ' + prediction + ' total goals in this match.';

        var ref = firebase.database().ref("Games/" + game + "/Pots/"+type+"/");
        var od;
        var sp;
        var prediction;
        var body;

        ref.once('value').then(function(snapshot) {
                od = parseFloat(snapshot.val().odds);
                sp = parseFloat(snapshot.val().spread);
                prediction = parseFloat(snapshot.val().prediction);
            return 'You bet ' + t;
        });
    }
}*/

function plus(i) {
    var y = parseFloat(i);

    if (y > 0)
        return '+' + y;
    else
        return y;
}


/*function showFeatured(){
    data-toggle="modal" data-target="#betModal1"onclick="showBet(\''+game+'\',\'MLT1\', \''+t1+'\', \''+t2+'\');
}*/

function betDetail(type, t1, t2, sp, prediction) {
    switch (type) {
        case 'MLT1':
            return 'You are betting on ' + t1 + ' to win ' + t2 + '.<br> ';
        case 'MLT2':
            return 'You are betting on ' + t2 + ' to win ' + t1 + '.<br> ';
        case 'SprT1':
            return 'You are betting on ' + t1 + ' to have more points than ' + t2 + ' <strong> after applying ' + sp + ' to ' + t1 + '\'s final score.</strong>';
        case 'SprT2':
            return 'You are betting on ' + t2 + ' to have more points than ' + t1 + ' <strong> after applying ' + sp + ' to ' + t2 + '\'s final score.</strong>';
        case 'TOver':
            return 'You are betting that there will be more than ' + prediction + ' total goals in this match.';
        case 'TUnder':
            return 'You are betting that there will be less than ' + prediction + ' total goals in this match.';
        case 'argentina':
        case 'england':
        case 'japan':
        case 'switzerland':
        case 'colombia':
        case 'belgium':
        case 'uruguay':
        case 'brazil':
        case 'portugal':
        case 'croatia':
        case 'denmark':
        case 'russia':
        case 'mexico':
        case 'spain':
        case 'sweden':
            return 'You are betting on ' + capFLetter2(type) + ' to win the 2018 World Cup Russia.';
        default:
            return '';
    }
}

function showBet(game, type, x, y) {
    var ref = firebase.database().ref("Games/" + game + "/Pots/" + type + "/");
    var od;
    var sp;
    var prediction;
    var body;
    var teamRef = firebase.database().ref("Games/" + game);
    var t1;
    var t2;
    var flag1;
    var flag2;


    teamRef.once('value').then(function (snapshot1) {
        t1 = snapshot1.val().team1;
        flag1 = snapshot1.val().flag1;
        t2 = snapshot1.val().team2;
        flag2 = snapshot1.val().flag2;
        console.log(type);

        ref.once('value').then(function (snapshot) {
            od = parseFloat(snapshot.val().odds);
            sp = parseFloat(snapshot.val().spread);
            prediction = parseFloat(snapshot.val().prediction);


            body = betDetail(type, t1, t2, sp, prediction);




            body += '<br>The payout for this is ' + od;

            if (od < 0)
                body += '<br>$' + (-1 * od) + ' bet to win $100';
            else
                body += '<br>$100 bet to win $' + od;

            document.getElementById("betModal1").innerHTML = '<div class ="container"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Bet Preview</h5> <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' + body + '<div class="modal-body"></div><div class="input-group input-group-sm mb-3"><div class="input-group-prepend"><span class="input-group-text">Bet Amount</span></div><input type="text" class="form-control" id="betAmount1" aria-label="Small" aria-describedby="inputGroup-sizing-sm"></div><div class="modal-footer" id="modalFooter"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary" data-dismiss="modal" onclick="bet(\'' + type + '\',\'' + game + '\',\'betAmount1\');">Bet Now!</button></div></div></div></div></div>';
        });
    });
}

function updateOdds() {
    var game = document.getElementById("game").value;
    var cardTitle = document.getElementById("cardTitle").value;
    var team1 = document.getElementById("team1").value;
    var team2 = document.getElementById("team2").value;
    var flag1 = document.getElementById("flag1").value;
    var flag2 = document.getElementById("flag2").value;
    var year = document.getElementById("year").value;
    var month = document.getElementById("month").value;
    var day = document.getElementById("day").value;
    var hour = document.getElementById("hour").value;
    var min = document.getElementById("min").value;
    var MLT1odds = document.getElementById("MLT1odds").value;
    var MLT2odds = document.getElementById("MLT2odds").value;
    var SprT1odds = document.getElementById("SprT1odds").value;
    var spreadT1 = document.getElementById("spreadT1").value;
    var SprT2odds = document.getElementById("SprT2odds").value;
    var spreadT2 = document.getElementById("spreadT2").value;
    var TOverOdds = document.getElementById("TOverodds").value;
    var predTotal = document.getElementById("prediction").value;
    var TUnderOdds = document.getElementById("TUnderodds").value;

    var d = new Date(year, month, day, hour, min);

    var ref = firebase.database().ref("Games/" + game);
    ref.set({
        Pots: {
            MLT1: {
                bets: 0,
                odds: MLT1odds,
                total: 0
            },
            MLT2: {
                bets: 0,
                odds: MLT2odds,
                total: 0
            },
            SprT1: {
                bets: 0,
                odds: SprT1odds,
                spread: spreadT1,
                total: 0
            },
            SprT2: {
                bets: 0,
                odds: SprT2odds,
                spread: spreadT2,
                total: 0
            },
            TOver: {
                bets: 0,
                odds: TOverOdds,
                prediction: predTotal,
                total: 0
            },
            TUnder: {
                bets: 0,
                odds: TUnderOdds,
                prediction: predTotal,
                total: 0
            }
        },
        gameID: game,
        date: d.toString(),
        profit: {
            ML: 0,
            Spr: 0,
            TOU: 0
        },
        flag1: flag1,
        flag2: flag2,
        team1: team1,
        team2: team2,
        t1: "<img src\"" + flag1 + "\" width=\"35\" height=\"35\" class=\"d-inline-block align-top\" alt=\"\"> " + team1,
        t2: "<img src\"" + flag2 + "\" width=\"35\" height=\"35\" class=\"d-inline-block align-top\" alt=\"\"> " + team2,
        cardTitle: cardTitle
    });
}