_OS = require('os');
_Cluster = require('cluster');
_http = require('http');
_url = require('url');
_querystring = require('querystring');
_fs = require('fs');
_crypto = require('crypto');

_rfc822Date = require('rfc822-date');

_ConfigFile = undefined;
if (_fs.existsSync("./Config.js")) {
	_ConfigFile = "./Config.js";
} else {
	_ConfigFile = "./Config.js.example";
}
_Config = require(_ConfigFile).Config;
responseWrapper = require('./responseWrapper.js').responseWrapper;
_writeHead = require('./writeHead.js');
_fscache = require('./fsCache.js');
_helper = require('./helper.js');
﻿var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");


function Init() {
	var handle = {};
	handle[_Config.root] = requestHandlers.Index;
	handle[_Config.root + "post/"] = requestHandlers.Post;
	handle[_Config.root + "page/"] = requestHandlers.Page;
	handle[_Config.root + "rss.xml"] = requestHandlers.RSS;

	server.Start(handle, router.Route, domain);
}




if (_Cluster.isMaster) {

	if (_Config.ClearCacheOnStart) {
		_fscache.clear();
	}

	for (var i = _Config.threads; i > 0; i--) {
		_Cluster.fork();
	};

	_Cluster.on('fork', function(worker) {
		console.log('worker #%d forked. (pid %d)', worker.id, worker.process.pid);
	});

	_Cluster.on('disconnect', function(worker, code, signal) {
		console.log('worker #%d (pid %d) disconnected (returned %s).', worker.id, worker.process.pid, signal || code || "undefined");
	});

	_Cluster.on('exit', function(worker, code, signal) {
		console.log('worker #%d (pid %d) died (returned %s). restarting...', worker.id, worker.process.pid, signal || code || "undefined");
		_Cluster.fork();
	});
} else if (_Cluster.isWorker) {

	var domain = require('domain').create();

	domain.on('error', function(e) {
		console.error('error', e.stack);
	});

	domain.run(Init);
}
