_OS = require('os');
_Cluster = require('cluster');
_http = require('http');
_url = require('url');
_querystring = require('querystring');
_fs = require('fs');
_Config = require('./Config.js').Config;
_writeHead = require('./writeHead.js');
﻿var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");

if (_Cluster.isMaster) {

    for (var i = _Config.threads; i > 0; i--) {
        _Cluster.fork();
    };

    _Cluster.on('fork', function(worker) {
        console.log('worker #%d forked. (pid %d)', worker.id, worker.process.pid);
    });

    _Cluster.on('disconnect', function(worker, code, signal) {
        console.log('worker #%d (pid %d) disconnected (code %s).', worker.id, worker.process.pid, signal || code || 0);
    });

    _Cluster.on('exit', function(worker, code, signal) {
        console.log('worker #%d (pid %d) died (code %s). restarting...', worker.id, worker.process.pid, signal || code || 0);
        _Cluster.fork();
    });
} else {

    var domain = require('domain').create();

    domain.on('error', function(e) {
        console.error('error', er.stack);
    });

    domain.run(Init);
}

function Init() {

    var handle = {};
    handle[_Config.root] = requestHandlers.Index;
    handle[_Config.root + "post/"] = requestHandlers.Post;

    // static content
    handle["/favicon.ico"] = requestHandlers.Favicon;
    handle["/" + requestHandlers.Fonts["Regular_path"]] = requestHandlers.Fonts["Regular"];
    handle["/" + requestHandlers.Fonts["Bold_path"]] = requestHandlers.Fonts["Bold"];

    server.Start(handle, router.Route, domain);
}
