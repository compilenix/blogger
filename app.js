_OS = require('os');
_Cluster = require('cluster');
_http = require('http');
_url = require('url');
_querystring = require('querystring');
_fs = require('fs');
_crypto = require('crypto');

_ConfigFile = undefined;
if (_fs.existsSync("./Config.js")) {
	_ConfigFile = "./Config.js";
} else {
	_ConfigFile = "./Config.js.example";
}
_Config = require(_ConfigFile).Config;
responseWrapper = require('./responseWrapper.js').responseWrapper;
_responseCodeMessage = require('./responseCodeMessage.js');
_helper = require('./helper.js');
﻿var server = require('./server.js');
var router = require('./router.js');
var requestHandlers = require("./requestHandlers.js");

function Init() {
	var handle = {};
	handle[_Config.root] = {callback: requestHandlers.Index, cache: true};
	handle[_Config.root + "static/"] = {callback: requestHandlers.Static, cache: false};
	handle[_Config.root + "post/"] = {callback: requestHandlers.Post, cache: true};
	handle[_Config.root + "page/"] = {callback: requestHandlers.Page, cache: true};
	handle[_Config.root + "ajax/"] = {callback: requestHandlers.Ajax, cache: false};
	handle[_Config.root + "rss.xml"] = {callback: requestHandlers.RSS, cache: true};
	handle[_Config.root + "edit"] = {callback: requestHandlers.Edit, cache: true};
	handle[_Config.root + "code/"] = {callback: requestHandlers.Code, cache: false};

	server.Start(handle, router.Route, domain);
}

_cache = {};

switch (_Config.cache) {
case 'fsCache':
	console.log('using fsCache module for caching');
	_cache = require('./fsCache.js');
	break;
case 'memCache':
	console.log('using memCache module for caching');
	var c = require('./memCache.js');
	_cache = new c.memCache();
	break;
case 'none':
default:
	console.log('using no cache');
	_cache = false;
	break;
}

if (_Cluster.isMaster) {

	if (_cache && _Config.ClearCacheOnStart) {
		_cache.clear();
	}

	if (_Config.threads <= 1) { _Config.threads = 1; }

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
