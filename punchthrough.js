#!/usr/bin/env node

var debug = require('debug')('punchthrough:cli');
var sio = require('socket.io-client');
var request = require('request');

var argv = require('yargs')
    .usage('Usage: $0 -r [remoteAddress]')
    .demand(['r'])
    .alias('r', 'remote')
    .help('h')
    .alias('h', 'help')
    .argv;
debug("parsed " + JSON.stringify(argv));

var io = sio(argv.remote);
io.on('connect', function () {
    debug("connected to " + argv.remote);
});
io.on('disconnect', function () {
    debug("disconnected");
})
io.on("reconnect_failed", function () {
    debug("reconnection failed");
});

io.on('query', function (queryOpts) {
    debug("got query " + JSON.stringify(queryOpts));

    request(queryOpts, function (err, res) {
        debug("response " + res.statusCode);
        io.emit('response', err, res);
    });
});