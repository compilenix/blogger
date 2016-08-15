#!/usr/bin/node

global.http = require("http");
global.fs = require("fs");
global.crypto = require("crypto");
global.util = require("util");
global.os = require("os");
global.child_process = require("child_process");
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

function GetFsDelimiter() {
    switch (os.platform()) {
        case "darvin":
        case "freebsd":
        case "linux":
        case "sunos":
        default:
            return "/";
        case "win32":
            return "\\";
    }
}

var config = require("../../Config.js").Config;

config.DevMode = true;
config.ClearCacheOnStart = true;
config.server.port = 8001;
config.server.Link = "http://127.0.0.1:" + config.server.port;
config.post.DirectoryPosts = "lib" + GetFsDelimiter() + "tests" + GetFsDelimiter() + "posts";

var testData = require("./data.js").data;

var node;

var startUnit = function(testId, unitId) {
    if ((testId < testData.length) && (unitId < testData[testId].units.length)) {
        const test = testData[testId].units[unitId];
        const options = test.sendHeader;
        options.hostname = "127.0.0.1";
        options.port = config.server.port;
        const req = http.request(options, function(res) {
            console.log("STATUS: " + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));

            res.setEncoding("utf8");

            res.on("data", function(chunk) {
                console.log("BODY");
            });

            res.on("end", function() {
                console.log("No more data in response.");
                startUnit(testId, unitId + 1);
            });
        });
        req.on("error", function(e) {
            console.log("\x1b[31mproblem with request\x1b[0m: " + e.message);
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

var startTest = function(testId) {
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

        node.stdout.on("data", function(data) {
            // process.stdout.write('\x1b[36mstdout\x1b[0m: ' + data);
            if (data.indexOf("Init done, waiting for clients/requests...") >= 0) {
                setTimeout(function() {
                    console.log("Start tests...");
                    startUnit(testId, 0);
                }, 100);
            }
        });

        node.stderr.on("data", function(data) {
            process.stderr.write("\x1b[31mstderr:\x1b[0m " + data);
        });

        node.on("close", function() {
            process.stdout.write("\x1b[36mstdout\x1b[0m: child process exited\n");
            startTest(testId + 1);
        });
    } else {
        console.log("Test's Done.");
    }
};
startTest(0);
