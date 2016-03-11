"use strict";

var cluster = require("cluster");
var domain = require("domain");

global.querystring = require("querystring");
global.url = require("url");
global.fs = require("fs");
global.crypto = require("crypto");
global.os = require("os");
global.zlib = require("zlib");
global.htmlenclode = require("htmlencode").htmlEncode;

var ConfigFile = undefined;
if (fs.existsSync("./Config.js")) {
    ConfigFile = "./Config.js";
} else {
    ConfigFile = "./Config.js.example";
}

console.log("loading config: " + ConfigFile);
global.Config = require(ConfigFile).Config;

process.argv.forEach(function (val, index, array) {
    switch (val) {
        case "config":
            console.log("Loading config from command line!");
            console.log(process.argv[index + 1]);
            global.Config = JSON.parse(process.argv[index + 1]);
            break;
    }
});

if (Config.DevMode) {
    Config.HeaderExpires = 0;
    Config.ClearCacheOnStart = true;
}

if (!fs.existsSync(Config.post.DirectoryPosts)) {
    fs.mkdirSync(Config.post.DirectoryPosts);
}

global.ResponseWrapper = require("./lib/responseWrapper.js").ResponseWrapper;
global.ResponseCodeMessage = require("./lib/responseCodeMessage.js");
global.Helper = require("./lib/helper.js");
global.router = require("./lib/router.js");
var server = require("./server.js");
var requestHandlers = require("./lib/requestHandlers.js");

function Init() {
    global.handle = [];
    handle.push({ match: /^\/static\/?.+$/, callback: requestHandlers.Static, cache: false });
    handle.push({ match: /^\/post\/?.+$/, callback: requestHandlers.Post, cache: true });
    handle.push({ match: /^\/ajax\?.+$/, callback: requestHandlers.ajax, cache: false });
    handle.push({ match: /^\/rss$|^\/rss.xml$/, callback: requestHandlers.RSS, cache: true });
    handle.push({ match: /^\/edit$|^\/edit\/$/, callback: requestHandlers.Edit, cache: false });
    handle.push({ match: /^\/code\/?.+$/, callback: requestHandlers.Code, cache: false });
    handle.push({ match: /^\/page\/?.+$/, callback: requestHandlers.Page, cache: true });
    handle.push({ match: /^\/$/, callback: requestHandlers.Index, cache: true });

    server.Start(router.Route);
}

require("./lib/cache/NullCache.js");
require("./lib/cache/FsCache.js");
require("./lib/cache/MemCache.js");

switch (Config.cache) {
    case "FsCache":
        console.log("using FsCache module for caching");
        global.Cache = new FsCache();
        break;
    case "MemCache":
        console.log("using MemCache module for caching");
        global.Cache = new MemCache();
        break;
    case "none":
    default:
        console.log("using no cache");
        global.Cache = new NullCache();
        break;
}

if (Config.DevMode) {
    if (Cache && Config.ClearCacheOnStart) {
        Cache.clear();
    }
    Init();
} else {
    if (cluster.isMaster) {

        if (Cache && Config.ClearCacheOnStart) {
            Cache.clear();
        }

        if (Config.threads <= 1) {
            Config.threads = 1;
        }

        for (var i = Config.threads; i > 0; i--) {
            cluster.fork();
        };

        cluster.on("fork", function (worker) {
            console.log("worker #%d forked. (pid %d)", worker.id, worker.process.pid);
        });

        cluster.on("disconnect", function (worker) {
            console.log("worker #%d (pid %d) disconnected.", worker.id, worker.process.pid);
        });

        cluster.on("exit", function (worker, code, signal) {
            console.log("worker #%d (pid %d) died (returned code %s; signal %s). restarting...", worker.id, worker.process.pid, code || "undefined", signal || "undefined");
            cluster.fork();
        });
    } else if (cluster.isWorker) {
        Init();
    }
}
