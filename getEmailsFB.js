var fs = require('fs'),
    loginPage = require('webpage').create(),
    urlAmico = require('webpage').create(),
    system = require('system');

loginPage.viewportSize = {
    width: 480,
    height: 5000
};

var goLogin = function(login, pass) {
    document.querySelector("input[name='email']").value = login;
    document.querySelector("input[name='pass']").value = pass;
    document.querySelector("#login_form").submit();
}

var scrollToBot = function() {
    window.scrollTo(0,
        Math.max(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
            Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
            Math.max(document.body.clientHeight, document.documentElement.clientHeight))
    );
}

var getFriendsNameAndUrls = function() {
    var nameUrl = new Array(),
        names = new Array(),
        urls = new Array(),
        tempUrls = new Array();

    var locateFriendsOnDom = document.querySelectorAll("._698");

    for (var i = 0; i < locateFriendsOnDom.length; i++) {
        var aux = locateFriendsOnDom[i].querySelector(".fcb a");
        tempUrls.push(aux.getAttribute('href'));
        names.push(aux.innerHTML);
    }

    for (var i = 0; i < tempUrls.length; i++) {
        if (tempUrls[i] != "#") {
            var aux = tempUrls[i].split("https://www.facebook.com/")[1].split("?")[0];
            if (aux != "profile.php") {
                undefinedrls.push("https://www.facebook.com/" + aux + "/about?section=contact-info");
            } else {
                var aux = tempUrls[i].split("https://www.facebook.com/")[1].split("&")[0];
                urls.push("https://www.facebook.com/" + aux + "&sk=about&section=contact-info");
            }
        } else urls.push("#");
    }

    nameUrl.push(names);
    nameUrl.push(urls);

    return nameUrl;
}

urlAmico.onLoadFinished = function(status) {
    console.log("Loaded friend number: " + window.helper);
}

//@todo : Refactor this shit;
var scrapWhatWheWant = function() {
    var resultado;
    var a = document.querySelector("._50f9 span");
    if (a != null) {
        return resultado = a.innerHTML;
    } else {
        var b = document.querySelector("span._50f7 span");
        if (b == null) {
            var c = document.querySelector("._4ea3");
            if (c) return resultado = "-";
            else return resultado = "#";
        } else {
            if (b.innerHTML == "http://facebook.com/" || b.innerHTML == "http://") return resultado = "#";
            if (typeof b.innerHTML == 'string' || b.innerHTML instanceof String)
                var c = b.innerHTML.split("http://");
            else {
                var c = "";
                c[0] = "";
            }
            if (c[0] != "") {
                b = b.innerHTML.split("@");
                b = b[0] + "@facebook.com";
                return resultado = b;
            }
        }
    }
}

var runBot = function(danames, thelist) {
    loginPage.close();
    window.clearInterval(window.kickstart);
    console.log("Running the bot itself");

    window.helper = 0;
    window.emailsNow = new Array();

    function bot() {
        return window.setInterval(function() {
            if (typeof thelist[window.helper] != "undefined") {
                // if (window.helper < 4) {
                if (thelist[window.helper] != "#") {
                    urlAmico.open(thelist[window.helper], function(status) {
                        if (status === "success") {
                            try {
                                window.emailsNow[window.helper] = urlAmico.evaluate(scrapWhatWheWant);
                            } catch (e) {
                                console.log(e);
                            }
                            window.helper++;
                        }
                    });
                } else {
                    window.emailsNow[window.helper] = "-";
                    window.helper++;
                }
            } else {
                var string = '';
                for (var z = 0; z < window.emailsNow.length; z++) {
                    string += danames[z] + " => " + window.emailsNow[z] + '\r\n';
                }
                fs.write('mails.txt', string, 'w');
                console.log("Its over...");
                phantom.exit();
            }
        }, 8000);
    }
    bot();
}

if (system.args.length === 1) {
    console.log('usage script.js facebookLogin facebookPassword');
    phantom.exit();
} else {
    loginPage.open("https://www.facebook.com/login.php?next=https://www.facebook.com/friends/", function(status) {
        if (status === "success") {
            console.log("---------- Starting ----------");
            loginPage.evaluate(goLogin, system.args[1], system.args[2]);
            var gotFriendsList = false;

            function preBot() {
                return window.setInterval(function() {
                    console.log("Getting friend list...");
                    var count = loginPage.content.match(/class="_30f _5jr3"/g);
                    if (count === null) {
                        loginPage.evaluate(scrollToBot);
                    } else {
                        if (!gotFriendsList) {
                            matrixOfWhatWeNeed = loginPage.evaluate(getFriendsNameAndUrls);
                            gotFriendsList = true;
                        } else {
                            runBot(matrixOfWhatWeNeed[0], matrixOfWhatWeNeed[1]);
                        }
                    }
                }, 1500);
            }
            window.kickstart = preBot();
        }
    });
}