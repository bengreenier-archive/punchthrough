# punchthrough
proxy requests across boundries

## What?

A module and cli to enable proxying of web requests across boundries. It works
by starting an in-process websocket server wherever the module is consumed, and
providing a cli that connects to this server from wherever you wish to proxy on-behalf of.
The module is then able to ask the cli to execute a request and return the results.

## How?

### To install

Easy - to get the module, `npm install punchthrough`. To get the cli, `npm install -g punchthrough`.

### To use

#### Module

> See [example](./example) or [the tests](./test) for more examples.

```
var punchthrough = require('punchthrough');

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
```

#### Cli

> See `punchthrough --help` for more info

```
Usage: C:\Program Files\nodejs\node_modules\punchthrough\punchthrough.js -r
[remoteAddress]

Options:
  -h, --help    Show help                                              [boolean]
  -r, --remote                                                        [required]

Missing required argument: r
```

## Module API

Create an instance first: `var instance = require('punchthrough')({port: 1})`

The API is a subset of the [request](https://npmjs.org/package/request) API:
+ instance(params) - make a request with the given params, passed through to request()
+ instance.get(params) - make a get request with the given params, passed through to request.get()
+ instance.post(params) - make a post request with the given params, passed through to request.post()

All the above return a promise.

+ instance.close() - if you've constructed your instance with `{port: <number>}` then this will shutdown the internally running http server

## License

MIT
