"use strict";

var cluster = require("cluster");
var domain = require("domain");

global.querystring = require("querystring");
global.url = require("url");
global.fs = require("fs");
global.crypto = require("crypto");
global.os = require("os");

var ConfigFile = undefined;
if (fs.existsSync("./Config.js")) {
    ConfigFile = "./Config.js";
} else {
    ConfigFile = "./Config.js.example";
}

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

if (!fs.existsSync(Config.post.DirectoryPosts)) {
    fs.mkdirSync(Config.post.DirectoryPosts);
}

global.ResponseWrapper = require("./ResponseWrapper.js").ResponseWrapper;
global.ResponseCodeMessage = require("./ResponseCodeMessage.js");
global.Helper = require("./Helper.js");
global.router = require("./router.js");
var server = require("./server.js");
var requestHandlers = require("./requestHandlers.js");

function Init() {
    global.handle = {};
    handle[Config.root] = { callback: requestHandlers.Index, cache: true };
    handle[Config.root + "static/"] = { callback: requestHandlers.Static, cache: false };
    handle[Config.root + "post/"] = { callback: requestHandlers.Post, cache: true };
    handle[Config.root + "page/"] = { callback: requestHandlers.Page, cache: true };
    handle[Config.root + "ajax/"] = { callback: requestHandlers.Ajax, cache: false };
    handle[Config.root + "rss.xml"] = { callback: requestHandlers.RSS, cache: true };
    handle[Config.root + "rss"] = { callback: requestHandlers.RSS, cache: true };
    handle[Config.root + "edit"] = { callback: requestHandlers.Edit, cache: true };
    handle[Config.root + "code/"] = { callback: requestHandlers.Code, cache: false };

    server.Start(router.Route);
}

global.NullCache = require("./NullCache.js").NullCache;
global.FsCache = require("./FsCache.js").FsCache;
global.MemCache = require("./MemCache.js").MemCache;

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