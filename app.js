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

process.argv.forEach(function (val, index, array) {
	switch (val) {
		case "config":
			logger.info("Loading config from command line!");
			logger.info(process.argv[index + 1]);
			Config = JSON.parse(process.argv[index + 1]);
			break;
	}
});

if (Config.DevMode) {
	Config.HeaderExpires = 0;
	Config.ClearCacheOnStart = true;
}

if (!fs.existsSync(Config.post.DirectoryPosts)) {
	logger.error("Posts-Directory is non-existing! creating new empty directory");
	try {
		fs.mkdirSync(Config.post.DirectoryPosts);
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
	handle.push({ match: /(^\/static\/?.+$)|(\/favicon.ico)/, callback: requestHandlers.Static, cache: false });
	handle.push({ match: /^\/post\/?.+$/, callback: requestHandlers.Post, cache: true });
	handle.push({ match: /^\/ajax\/?.+$/, callback: requestHandlers.Ajax, cache: false });
	handle.push({ match: /^\/rss$|^\/rss.xml$/, callback: requestHandlers.RSS, cache: true });
	handle.push({ match: /^\/edit$|^\/edit\/$/, callback: requestHandlers.Edit, cache: false });
	handle.push({ match: /^\/code\/?.+$/, callback: requestHandlers.Code, cache: false });
	handle.push({ match: /^\/page\/?.+$/, callback: requestHandlers.Page, cache: true });
	handle.push({ match: /^(\/find\/?.+)|(\/search\/?.+)|(\/\?q=)|(\/\?search=)$/, callback: requestHandlers.Find, cache: true });
	handle.push({ match: /^\/$/, callback: requestHandlers.Index, cache: true });

	server.Start(router.Route);
}

require("./lib/cache/NullCache.js");
require("./lib/cache/FsCache.js");
require("./lib/cache/MemCache.js");

switch (Config.cache) {
	case "FsCache":
		if (cluster.isMaster) {
			logger.info("using FsCache module for caching");
		}
		global.Cache = new FsCache();
		break;
	case "MemCache":
		if (cluster.isMaster) {
			logger.info("using MemCache module for caching");
		}
		global.Cache = new MemCache();
		break;
	case "none":
	default:
		if (cluster.isMaster) {
			logger.info("using no cache");
		}
		global.Cache = new NullCache();
		break;
}

if (Config.Version && Config.Version !== ConfigDefault.Version) {
	logger.info("Config version difference detected (reference was \"" + ConfigDefaultFile + "\") -> clearing cache...");
	Cache.clear();
	logger.info("Please update your Config.js!");
	process.exit(1);
}

if (Config.DevMode) {
	if (Cache && Config.ClearCacheOnStart) {
		Cache.clear();
	}
	Init();
} else {
	if (cluster.isMaster) {
		logger.info("platform: " + process.platform);
		logger.info("architecture: " + process.arch);
		logger.info("versions: " + JSON.stringify(process.versions));
		logger.info("command line arguments: " + process.argv);

		if (Cache && Config.ClearCacheOnStart) {
			Cache.clear();
		}

		if (Config.threads <= 1) {
			Config.threads = 1;
		}

		for (var i = Config.threads; i > 0; i--) {
			cluster.fork();
		}

		cluster.on("fork", function (worker) {
			logger.info("worker #%d forked. (pid %d)", worker.id, worker.process.pid);
		});

		cluster.on("disconnect", function (worker) {
			logger.info("worker #%d (pid %d) disconnected.", worker.id, worker.process.pid);
		});

		cluster.on("exit", function (worker, code, signal) {
			logger.info("worker #%d (pid %d) died (returned code %s; signal %s). restarting...", worker.id, worker.process.pid, code || "undefined", signal || "undefined");
			cluster.fork();
		});
	} else if (cluster.isWorker) {
		Init();
	}
}
