global.cluster = require("cluster");
var fs = require("fs");
var logger = require("./lib/logger.js");

logger.setLogLevel(logger.level.DEBUG);

var ConfigFile = undefined;
const ConfigDefaultFile = "./Config.js.example";
if (fs.existsSync("./Config.js")) {
	ConfigFile = "./Config.js";
} else {
	ConfigFile = ConfigDefaultFile;
}

global.Config = require(ConfigFile).Config;
global.ConfigDefault = require(ConfigDefaultFile).Config;

process.argv.forEach(function (val, index) {
	switch (val) {
		case "config":
			logger.info("Loading config from command line!");
			logger.info(process.argv[index + 1]);
			global.Config = JSON.parse(process.argv[index + 1]);
			break;
	}
});

if (global.Config.DevMode) {
	global.Config.HeaderExpires = 0;
	global.Config.ClearCacheOnStart = true;
}

if (!fs.existsSync(global.Config.post.DirectoryPosts)) {
	logger.error("Posts-Directory is non-existing! creating new empty directory");
	try {
		fs.mkdirSync(global.Config.post.DirectoryPosts);
	} catch (error) {
		logger.error("Posts-Directory couldn't be created, see following error");
		logger.error(error);
		process.exit(1);
	}
}

global.ResponseWrapper = require("./lib/responseWrapper.js").ResponseWrapper;
global.ResponseCodeMessage = require("./lib/responseCodeMessage.js");
global.Helper = require("./lib/helper.js");
global.router = require("./lib/router.js");
global.server = require("./server.js");
global.requestHandlers = require("./lib/requestHandlers.js");

global.handle = [];
function Init() {
	global.handle.push({ match: /(^\/static\/?.+$)|(\/favicon.ico)/, callback: global.requestHandlers.Static, cache: false });
	global.handle.push({ match: /^\/post\/?.+$/, callback: global.requestHandlers.Post, cache: true });
	global.handle.push({ match: /^\/ajax\/?.+$/, callback: global.requestHandlers.Ajax, cache: false });
	global.handle.push({ match: /^\/rss$|^\/rss.xml$/, callback: global.requestHandlers.RSS, cache: true });
	global.handle.push({ match: /^\/edit$|^\/edit\/$/, callback: global.requestHandlers.Edit, cache: false });
	global.handle.push({ match: /^\/code\/?.+$/, callback: global.requestHandlers.Code, cache: false });
	global.handle.push({ match: /^\/page\/?.+$/, callback: global.requestHandlers.Page, cache: true });
	global.handle.push({ match: /^(\/find\/?.+)|(\/search\/?.+)|(\/\?q=)|(\/\?search=)$/, callback: global.requestHandlers.Find, cache: true });
	global.handle.push({ match: /^\/$/, callback: global.requestHandlers.Index, cache: true });

	global.server.Start(global.router.Route);
}

require("./lib/cache/NullCache.js");
require("./lib/cache/FsCache.js");
require("./lib/cache/MemCache.js");

switch (global.Config.cache) {
	case "FsCache":
		if (global.cluster.isMaster) {
			logger.info("using FsCache module for caching");
		}
		global.Cache = new global.FsCache();
		break;
	case "MemCache":
		if (global.cluster.isMaster) {
			logger.info("using MemCache module for caching");
		}
		global.Cache = new global.MemCache();
		break;
	case "none":
	default:
		if (global.cluster.isMaster) {
			logger.info("using no cache");
		}
		global.Cache = new global.NullCache();
		break;
}

if (global.Config.Version && global.Config.Version !== global.ConfigDefault.Version) {
	logger.info("Config version difference detected (reference was \"" + ConfigDefaultFile + "\") -> clearing cache...");
	global.Cache.clear();
	logger.info("Please update your Config.js!");
	process.exit(1);
}

if (global.Config.DevMode) {
	if (global.Cache && global.Config.ClearCacheOnStart) {
		global.Cache.clear();
	}
	Init();
} else {
	if (global.cluster.isMaster) {
		logger.info("platform: " + process.platform);
		logger.info("architecture: " + process.arch);
		logger.info("versions: " + JSON.stringify(process.versions));
		logger.info("command line arguments: " + process.argv);

		if (global.Cache && global.Config.ClearCacheOnStart) {
			global.Cache.clear();
		}

		if (global.Config.threads <= 1) {
			global.Config.threads = 1;
		}

		for (var i = global.Config.threads; i > 0; i--) {
			global.cluster.fork();
		}

		global.cluster.on("fork", function (worker) {
			logger.info("worker #%d forked. (pid %d)", worker.id, worker.process.pid);
		});

		global.cluster.on("disconnect", function (worker) {
			logger.info("worker #%d (pid %d) disconnected.", worker.id, worker.process.pid);
		});

		global.cluster.on("exit", function (worker, code, signal) {
			logger.info("worker #%d (pid %d) died (returned code %s; signal %s). restarting...", worker.id, worker.process.pid, code || "undefined", signal || "undefined");
			global.cluster.fork();
		});
	} else if (global.cluster.isWorker) {
		Init();
	}
}
