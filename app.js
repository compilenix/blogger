require("use-strict");
const cluster = require("cluster");
const fs = require("fs");

const Server = require("./Server.js");
const RequestHandler = require("./lib/RequestHandler.js");
const NullCache = require("./lib/cache/NullCache.js");
const FsCache = require("./lib/cache/FsCache.js");
const MemCache = require("./lib/cache/MemCache.js");

const logger = require("./lib/Logger.js");
let config = require("./Config.js");

process.argv.forEach(function (val, index) {
	switch (val) {
		case "config":
			logger.info("Loading config from command line!");
			logger.info(process.argv[index + 1]);
			config = JSON.parse(process.argv[index + 1]);
			break;
	}
});

if (config.DevMode) {
	config.HeaderExpires = 0;
	config.ClearCacheOnStart = true;
}

if (!fs.existsSync(config.post.DirectoryPosts)) {
	logger.error("Posts-Directory is non-existing! creating new empty directory");
	try {
		fs.mkdirSync(config.post.DirectoryPosts);
	} catch (error) {
		logger.error("Posts-Directory couldn't be created, see following error", error);
		process.exit(1);
	}
}

const server = new Server();
let cache = new NullCache();

// TODO move cache from each worker to master
switch (config.cache) {
	case "FsCache":
		if (cluster.isMaster) {
			logger.info("using FsCache module for caching");
		}
		cache = new FsCache();
		break;
	case "MemCache":
		if (cluster.isMaster) {
			logger.info("using MemCache module for caching");
		}
		cache = new MemCache();
		break;
	default:
		if (cluster.isMaster) {
			logger.info("using no cache");
		}
		break;
}

const requestHandler = new RequestHandler();
const handle = [];

function StartServer() {
	handle.push({
		match: /(^\/static\/?.+$)|(\/favicon\.ico)|(\/worker-html\.js)/,
		callback: requestHandler.get("Static"),
		cache: false
	});
	handle.push({
		match: /^\/post\/?.+$/,
		callback: requestHandler.get("Post"),
		cache: true
	});
	handle.push({
		match: /^\/ajax\/?.+$/,
		callback: requestHandler.get("Ajax"),
		cache: false
	});
	handle.push({
		match: /^\/rss$|^\/rss.xml$/,
		callback: requestHandler.get("RSS"),
		cache: true
	});
	handle.push({
		match: /^\/edit$|^\/edit\/$/,
		callback: requestHandler.get("Edit"),
		cache: false
	});
	handle.push({
		match: /^\/code\/?.+$/,
		callback: requestHandler.get("Code"),
		cache: false
	});
	handle.push({
		match: /^\/page\/?.+$/,
		callback: requestHandler.get("Page"),
		cache: true
	});
	handle.push({
		match: /^(\/find\/?.+)|(\/search\/?.+)|(\/\?q=)|(\/\?search=)$/,
		callback: requestHandler.get("Find"),
		cache: true
	});
	handle.push({
		match: /^\/$/,
		callback: requestHandler.get("Index"),
		cache: true
	});

	if (!fs.existsSync(config.templatePath)) {
		logger.error("template-Directory is non-existing! creating new empty directory");

		try {
			fs.mkdirSync(config.templatePath);
		} catch (error) {
			logger.error("template-Directory couldn't be created, see following error", error);
			process.exit(1);
		}
	}

	server.setCacheModule(cache);
	server.setRequestHandlers(handle);
	server.Start();
}

// TODO config.Version !== ConfigDefault.Version
// if (config.Version && config.Version !== ConfigDefault.Version) {
// 	logger.info("Config version difference detected (reference was \"" + configDefaultFile + "\") -> clearing cache...");
// 	Cache.clear();
// 	logger.info("Please update your Config.js!");
// 	process.exit(1);
// }

if (config.DevMode) {
	if (cache && config.ClearCacheOnStart) {
		cache.clear();
	}

	StartServer();
} else {
	if (cluster.isMaster) {
		logger.info("platform: " + process.platform);
		logger.info("architecture: " + process.arch);
		logger.info("versions: " + JSON.stringify(process.versions));
		logger.info("command line arguments: " + process.argv);

		if (cache && config.ClearCacheOnStart) {
			cache.clear();
		}

		if (config.threads <= 1) {
			config.threads = 1;
		}

		for (let i = config.threads; i > 0; i--) {
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
		StartServer();
	}
}
