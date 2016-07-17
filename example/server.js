var punchthrough = require('../lib');

var pt = punchthrough({
    port: 3001
}).on('connected', function () {
    console.log("connected");

    pt({
        url: "http://bing.com",
        method: "GET"
    }).then(function (res) {
        console.log(res.statusCode, res.body);
    }, function (err) {
        console.error("ERR " + err);
    });
}).on('disconnected', function () {
    console.log("disconnected");
});