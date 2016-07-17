var assert = require('assert');
var spawn = require('child_process').spawnSync;

var punchthrough = require("../lib");

//TODO these don't actually run yet, they're only here for demo purposes
describe("punchthrough", function () {
    describe("module", function () {
        it("should be simple to use", function () {
            // option a (easiest)
            var pt = punchthrough({
                port: process.env.PORT || 3001
            });
            pt.close();

            // option b (clearest)
            var server = require('http').createServer(app);
            var io = require('socket.io')(server);
            punchthrough({
                io: io
            });
            server.listen(process.env.PORT || 3001);
            server.close();
        });
    });

    describe("cli", function () {
        it("should startup", function () {
            var remoteAddress = "http://localhost";
            assert.equal(spawn("node", ['../punchthrough.js', '-r', remoteAddress]).status, 0);
        });
    });
});