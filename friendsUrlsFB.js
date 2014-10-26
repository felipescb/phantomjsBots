var fs = require('fs');
var page = require('webpage').create();
var system = require('system');


page.viewportSize = {
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
                urls.push("https://www.facebook.com/" + aux);
            } else {
                var aux = tempUrls[i].split("https://www.facebook.com/")[1].split("&")[0];
                urls.push("https://www.facebook.com/" + aux);
            }
        } else urls.push("#");
    }

    nameUrl.push(names);
    nameUrl.push(urls);

    return nameUrl;
}

if (system.args.length === 1) {
    console.log('usage script.js facebookLogin facebookPassword');
    phantom.exit();
} else {
    console.log("---------- Starting ----------");
    page.open("https://www.facebook.com/login.php?next=https://www.facebook.com/friends/", function(status) {
        if (status === "success") {
            console.log("---------- Logging into FB ----------")
            page.evaluate(goLogin, system.args[1], system.args[2]);
            var gotFriendsList = false;

            function bot() {
                return window.setInterval(function() {
                    var count = page.content.match(/class="_30f _5jr3"/g);
                    if (count === null) {
                        page.evaluate(scrollToBot);
                    } else {
                        if (!gotFriendsList) {
                            matrixOfWhatWeNeed = page.evaluate(getFriendsNameAndUrls);
                            var string = '';
                            for (var z = 0; z < matrixOfWhatWeNeed[0].length; z++) {
                                string += matrixOfWhatWeNeed[0][z] + ' - ' + matrixOfWhatWeNeed[1][z] + '\r\n';
                            }
                            try {
                                fs.write('namesUrls.txt', string, 'w');
                                gotFriendsList = true;
                            } catch (e) {
                                console.log(e);
                            }
                        } else {
                            console.log("---------- Over ----------");
                            phantom.exit();
                        }
                    }
                }, 2500);
            }

            bot();
        }
    });
}