#!/usr/bin/node
/* eslint no-console: "off"*/

const os = require("os");
const child_process = require("child_process");

const spawn = child_process.spawn;

function GetFsDelimiter() {
	switch (os.platform()) {
		case "win32":
			return "\\";
		default:
			return "/";
	}
}

let config = require("../../Config.js");

config.DevMode = true;
config.ClearCacheOnStart = true;
config.server.port = 8001;
config.server.Link = "http://127.0.0.1:" + config.server.port;
config.post.DirectoryPosts = "lib" + GetFsDelimiter() + "tests" + GetFsDelimiter() + "posts";

let http;

if (config.EnableHttp2 && config.Https.Enabled) {
	if (config.DevMode) {
		console.log("Start server with https AND h2 enabled");
	}
	http = require("http2");
} else if (config.Https.Enabled) {
	if (config.DevMode) {
		console.log("Start server with https enabled");
	}
	http = require("https");
} else {
	if (config.DevMode) {
		console.log("Start server with http");
	}
	http = require("http");
}

let testData = require("./data.js");
let node;
let startUnit = (testId, unitId) => {
	if ((testId < testData.length) && (unitId < testData[testId].units.length)) {
		const test = testData[testId].units[unitId];
		const options = test.sendHeader;
		options.hostname = "127.0.0.1";
		options.port = config.server.port;
		const req = http.request(options, function(res) {
			console.log("STATUS: " + res.statusCode);
			// console.log('HEADERS: ' + JSON.stringify(res.headers));

			res.setEncoding("utf8");

			res.on("data", () => {
				console.log("BODY");
			});

			res.on("end", () => {
				console.log("No more data in response.");
				startUnit(testId, unitId + 1);
			});
		});
		req.on("error", (error) => {
			console.log("\x1b[31mproblem with request\x1b[0m: " + error.message);
			node.kill();
			process.exit(1);
		});
		req.end();
		// console.log(util.inspect(req, { showHidden: true, depth: null, colors: true }));
	} else {
		console.log("Test Done.");
		node.kill();
	}
};

let startTest = (testId) => {
	if (testId < testData.length) {
		config.server.port += 1;
		config.server.Link = "http://127.0.0.1:" + config.server.port;
		config.post.DirectoryPosts = "lib" + GetFsDelimiter() + "tests" + GetFsDelimiter() + "posts";
		config.DirectoryCache = "lib" + GetFsDelimiter() + "tests" + GetFsDelimiter() + "cache";
		const testConfig = config;
		for (let i = 0; i < testData[testId].config.length; i++) {
			const key = testData[testId].config[i].key;
			const val = testData[testId].config[i].value;
			testConfig[key] = val;
		}

		node = spawn("node", ["./app.js", "config", JSON.stringify(testConfig)]);

		node.stdout.on("data", (data) => {
			// process.stdout.write('\x1b[36mstdout\x1b[0m: ' + data);
			if (data.indexOf("Init done, waiting for clients/requests...") >= 0) {
				setTimeout(function() {
					console.log("Start tests...");
					startUnit(testId, 0);
				}, 100);
			}
		});

		node.stderr.on("data", (data) => {
			process.stderr.write("\x1b[31mstderr:\x1b[0m " + data);
		});

		node.on("close", () => {
			process.stdout.write("\x1b[36mstdout\x1b[0m: child process exited\n");
			startTest(testId + 1);
		});
	} else {
		console.log("Test's Done.");
	}
};

startTest(0);
