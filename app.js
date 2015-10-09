"use strict"

var _cluster = require('cluster');
var _domain = require('domain');

global._querystring = require('querystring');
global._url = require('url');
global._fs = require('fs');
global._crypto = require('crypto');

var _ConfigFile = undefined;
if (_fs.existsSync("./Config.js")) {
	_ConfigFile = "./Config.js";
} else {
	_ConfigFile = "./Config.js.example";
}

global._Config = require(_ConfigFile).Config;

if (! _fs.existsSync(_Config.post.DirectoryPosts)) {
	_fs.mkdirSync(_Config.post.DirectoryPosts);
}

var responseWrapper = require('./responseWrapper.js').responseWrapper;
var _responseCodeMessage = require('./responseCodeMessage.js');
var _helper = require('./helper.js');
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
	handle[_Config.root + "rss"] = {callback: requestHandlers.RSS, cache: true};
	handle[_Config.root + "edit"] = {callback: requestHandlers.Edit, cache: true};
	handle[_Config.root + "code/"] = {callback: requestHandlers.Code, cache: false};

	server.Start(handle, router.Route);
}

var _cache = {};

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

if (_cluster.isMaster) {

	if (_cache && _Config.ClearCacheOnStart) {
		_cache.clear();
	}

	if (_Config.threads <= 1) { _Config.threads = 1; }

	for (var i = _Config.threads; i > 0; i--) {
		_cluster.fork();
	};

	_cluster.on('fork', function(worker) {
		console.log('worker #%d forked. (pid %d)', worker.id, worker.process.pid);
	});

	_cluster.on('disconnect', function(worker) {
		console.log('worker #%d (pid %d) disconnected.', worker.id, worker.process.pid);
	});

	_cluster.on('exit', function(worker, code, signal) {
		console.log('worker #%d (pid %d) died (returned code %s; signal %s). restarting...', worker.id, worker.process.pid, code || "undefined", signal || "undefined");
		_cluster.fork();
	});
} else if (_cluster.isWorker) {
	Init();
}
