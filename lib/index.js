var Promise = require('bluebird').Promise;

/**
 * The creator 
 */
module.exports = function create(opts) {
    opts = opts || {};

    if (opts.io) {
        opts.io.use(middleware.bind(opts.io));

        return makeApi(opts.io);
    }if (opts.port) {
        var server = require('http').createServer();
        var io = require('socket.io')(server);
        io.use(middleware.bind(io));
        server.listen(opts.port);

        return makeApi(io, server);
    } else {
        throw new Error('Missing io or port argument');
    }
}

/**
 * Middleware that forces only one socket.io connection is allowed
 */
function middleware(socket, next) {
    var ioInstance = this;
    this.clients(function (error, clients) {
        if (clients.length >= 1) {
            next(new Error('Max clients reached'));
        } else {
            return next();
        }
    });
}

/**
 * Api creator
 */
function makeApi(io, server) {
    /**
     * make a request
     */
    var api = function generic(queryArgs) {
        return new Promise(function (resolve, reject) {
            if (io.__punchthrough_socket == null)
            {
                return reject(new Error('No connected socket'));
            }

            io.__punchthrough_socket.emit('query', queryArgs);
            io.__punchthrough_socket.on('response', function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    /**
     * Internal storage for on implementation
     */
    api._eventHandlers = {};

    /**
     * Add an event listener
     */
    api.on = function (eventName, handler) {
        if (!api._eventHandlers[eventName]) {
            api._eventHandlers[eventName] = [];
        }
        api._eventHandlers[eventName].push(handler);

        // make on chainable
        return api;
    }

    // we track a bunch of things when the socket connects
    io.on('connection', function (socket) {
        // buckle up
        io.__punchthrough_socket = socket;

        if (api._eventHandlers["connected"]) {
            for (var i = 0 ; i < api._eventHandlers["connected"].length; i++) {
                api._eventHandlers["connected"][i]();
            }
        }

        io.__punchthrough_socket.on('disconnect', function () {
            io.__punchthrough_socket = null;
            if (api._eventHandlers["disconnected"]) {
                for (var i = 0 ; i < api._eventHandlers["disconnected"].length; i++) {
                    api._eventHandlers["disconnected"][i]();
                }
            }
        })
    });

    /**
     * make a get request
     */
    api.get = function get(queryArgs) {
        queryArgs['method'] = 'get';
        return new Promise(function (resolve, reject) {
            if (io.__punchthrough_socket == null)
            {
                return reject(new Error('No connected socket'));
            }
            
            io.__punchthrough_socket.emit('query', queryArgs);
            io.__punchthrough_socket.on('response', function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    /**
     * make a post request
     */
    api.post = function post() {
        queryArgs['method'] = 'post';
        return new Promise(function (resolve, reject) {
            if (io.__punchthrough_socket == null)
            {
                return reject(new Error('No connected socket'));
            }
            
            io.__punchthrough_socket.emit('query', queryArgs);
            io.__punchthrough_socket.on('response', function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    // If we're using a custom server (that we made)
    if (server) {
        /**
         * Close the internal server
         */
        api.close = function closeServer() {
            return server.close();
        }
    }

    // and return the created api function-object
    return api;
}