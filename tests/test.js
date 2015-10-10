#!/usr/bin/node --use_strict

"use strict"

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');
var util = require("util");
var child_process = require('child_process');
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

if (fs.existsSync(__dirname + "/../Config.js")) {
	var config = require(__dirname + "/../Config.js").Config;
} else {
	console.error("File not found: \"" + __dirname + "/../Config.js\"");
	process.exit(1);
}

config.DevMode = true;
config.ClearCacheOnStart = true;
config.server.port = 8001;
config.server.Link = "http://127.0.0.1:" + config.server.port;
config.post.DirectoryPosts = "tests/posts";

if (fs.existsSync(__dirname + "/data.js")) {
	var testData = require('./data.js').data;
} else {
	console.error("File not found: \"" + __dirname + "/data.js");
	process.exit(1);
}

var node;

var startUnit = function(testID, unitID) {
	if ((testID < testData.length) && (unitID < testData[testID].units.length)) {
		var test = testData[testID].units[unitID];
		var options = test.sendHeader;

		options.hostname = "127.0.0.1";
		options.port = config.server.port;

		var req = http.request(options, function(res) {
			console.log('STATUS: ' + res.statusCode);
			// console.log('HEADERS: ' + JSON.stringify(res.headers));

			res.setEncoding('utf8');

			res.on('data', function (chunk) {
				console.log('BODY');
			});

			res.on('end', function() {
				console.log('No more data in response.')
				startUnit(testID, unitID + 1);
			})
		});

		req.on('error', function(e) {
			console.log('\x1b[31mproblem with request\x1b[0m: ' + e.message);
			node.kill("SIGQUIT");
			process.exit(1);
		});
		req.end();
		// console.log(util.inspect(req, { showHidden: true, depth: null, colors: true }));
	} else {
		console.log("Test Done.");
		node.kill("SIGQUIT");
	}
}

var startTest = function(testID) {
	if (testID < testData.length) {
		config.server.port += 1;
		config.server.Link = "http://127.0.0.1:" + config.server.port;
		var testConfig = config;

		for (var i = 0; i < testData[testID].config.length; i++) {
			var key = testData[testID].config[i].key;
			var val = testData[testID].config[i].value;
			testConfig[key] = val;
		}

		node = spawn('/usr/bin/node', ["--use_strict", __dirname + "/../app.js", "config", JSON.stringify(testConfig)]);

		node.stdout.on('data', function (data) {
			// process.stdout.write('\x1b[36mstdout\x1b[0m: ' + data);
			if (data.indexOf("Init done.") >= 0) {
				setTimeout(function() {
					console.log("Start tests...");
					startUnit(testID, 0);
				}, 100);
			};
		});

		node.stderr.on('data', function (data) {
			process.stderr.write('\x1b[31mstderr:\x1b[0m ' + data);
		});

		node.on('close', function () {
			process.stdout.write('\x1b[36mstdout\x1b[0m: child process exited\n');
			startTest(testID + 1);
		});
	} else {
		console.log("Test's Done.");
	}
}

startTest(0);
