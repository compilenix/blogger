const http = require("http");
const https = require("https");
const http2 = require("http2");
const domain = require("domain");
const url = require("url");
const fs = require("fs");
const querystring = require("querystring");

const ResponseWrapper = require("./lib/ResponseWrapper.js");
const ResponseCodeMessage = require("./lib/ResponseCodeMessage.js");
const Router = require("./lib/Router.js");

const config = require("./Config.js");
const logger = require("./lib/logger.js");
let httpServerToUse = "http";

// TODO create Server class

const Port = config.server.port;

/** @type {https.ServerOptions} */
const httpsOptions = {
	key: config.Https.Key,
	cert: config.Https.Cert
};

if (config.EnableHttp2 && config.Https.Enabled) {
	logger.info("Start server with https AND h2 enabled");
	httpServerToUse = "http2";
} else if (config.Https.Enabled) {
	logger.info("Start server with https enabled");
	httpServerToUse = "https";
} else {
	logger.info("Start server with http");
	httpServerToUse = "http";
}

/**
 * @param {Router} route
 */
function Start(route) {
	let onErrRes = null;

	/**
	 * @param {http.IncomingMessage} request
	 * @param {http.ServerResponse} response
	 */
	function onRequest(request, response) {
		const res = new ResponseWrapper(response);

		if (!config.DevMode) {
			onErrRes = res;
		}

		process_request(request, res, route);
	}

	/**
	 * @param {Error} error
	 */
	function onErr(error) {
		logger.error("Internal Server Error", error);

		if (!config.DevMode) {
			onErrRes.setResponseCode(500);
			onErrRes.setContent("");
			ResponseCodeMessage.ResponseCodeMessage(onErrRes);
			onErrRes.send();
		}

		process.exit(1);
	}

	if (config.DevMode) {
		logger.info("Starting Server on port: " + Port);

		switch (httpServerToUse) {
			case "http":
				http.createServer(onRequest).listen(Port);
				break;
			case "https":
				https.createServer(httpsOptions, onRequest).listen(Port);
				break;
			case "http2":
				http2.createServer(httpsOptions, onRequest).listen(Port);
				break;
		}
	} else {
		const currentDomain = domain.create();
		currentDomain.on("error", onErr);

		currentDomain.run(() => {
			logger.info("Starting Server on port: " + Port);

			switch (httpServerToUse) {
				case "http":
					http.createServer(onRequest).listen(Port);
					break;
				case "https":
					https.createServer(httpsOptions, onRequest).listen(Port);
					break;
				case "http2":
					http2.createServer(httpsOptions, onRequest).listen(Port);
					break;
			}
		});
	}
	logger.info("Init done, waiting for clients/requests...");
}

function process_request(request, response, route) {
	const query = url.parse(request.url).path;

	if (config.DevMode) {
		logger.info("process_request: " + request.url);
	}

	// TODO use this.router given by constructor
	if (!router.RouteExists(query)) {
		if (config.DevMode) {
			logger.info("404: " + (query === undefined ? "undefined" : query));
		}

		response.setResponseCode(404);
		response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
		response.send();
		return false;
	}

	// TODO use this.requestHandlers given by constructor or setter method
	// TODO helper
	// TODO use this.cache given by constructor or setter method
	if (router.GetRoute(query).callback === requestHandlers.Static && (request.headers["cache-control"] !== "no-cache")) {
		const path = Helper.replaceAll("/", Helper.GetFsDelimiter(), config.staticContentPath);
		let lastModified;

		if (query === "/favicon.ico") {
			lastModified = new Date(fs.statSync(path + Helper.GetFsDelimiter() + "favicon.ico").mtime).toUTCString();
		} else if (query === "/worker-html.js") {
			lastModified = new Date(fs.statSync(path + Helper.GetFsDelimiter() + "worker-html.js").mtime).toUTCString();
		} else {
			let file = path + Helper.GetFsDelimiter() + querystring.parse(url.parse(request.url).query)["f"];

			try {
				fs.accessSync(file, fs.F_OK);
				lastModified = new Date(fs.statSync(file).mtime).toUTCString(); // TODO fix this
			} catch (error) {
				response.setResponseCode(404);
				ResponseCodeMessage.ResponseCodeMessage(response);
				response.send();
				return false;
			}
		}

		if (lastModified === request.headers["if-modified-since"]) {
			response.setResponseCode(304);
			response.setLastModified(lastModified);
			response.send();
		}
	}

	let cacheLastModified = cache.getLastModified(request);
	let cacheHasRequest = cache.has(request);
	if (cacheHasRequest && request.headers["if-modified-since"] === cacheLastModified) {
		response.setResponseCode(304);
		response.setLastModified(cacheLastModified);
		response.send();
	} else {
		const deliverCache = !(config.HandleClientCacheControl && request.headers["cache-control"] === "no-cache");
		const writeCache = router.RouteGetCacheEnabled(query);
		if (deliverCache && cacheHasRequest) {
			cache.send(request, response);
			return false;
		}

		var data = route(query, request);

		if (request.method === "POST") {
			var body = "";

			request.on("data", (postData) => {
				// reading http POST body
				if (body.length + postData.length < config.MaxHttpPOSTSize) {
					body += postData;
				} else {
					// Request entity too large
					response.setResponseCode(413);
					response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
					response.send();
					return false;
				}
				return true;
			});

			request.on("end", () => {
				// after reading the http POST body, call the callback function "data()" from request handler
				sendData(data(body, request), request, response, writeCache);
			});
			return true;
		} else if (request.method === "GET") {
			if (!sendData(data, request, response, writeCache)) {
				return false;
			}
		} else {
			// unknown http method
			response.setResponseCode(501);
			response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
			response.send();
			return false;
		}
	}

	return true;
}

/*
 * "data.type" MUST be set to a valid http status code (default: 500 "Internal Server Error")
 * returns false if response has been send
 */
function sendData(data, request, response, writeCache) {
	if (data && data.type) {
		if (data.mimetype) {
			response.setContentType(data.mimetype);
		}

		if (data.code) {
			response.setResponseCode(data.code);
		}

		if (data.type === "file" && data.content) {
			response.setResponseCode(data.code || 200);
			response.setLastModified(new Date(fs.statSync(data.content).mtime).toUTCString());
			response.contentLength = fs.statSync(data.content).size;
			response.sendFileStream(fs.createReadStream(data.content));
			return false;
		}

		if (data.content) {
			response.setContent(data.content);
		}

		ResponseCodeMessage.ResponseCodeMessage(response);

		if (writeCache && (data.code > 99 && data.code < 300)) {
			cache.add(request, data.content, data.mimetype, data.code);
			response.setLastModified(cache.getLastModified(request));
		}

		if (config.EnableHttp2 && config.Https.Enabled && data.push) {
			data.push.forEach(function(element) {
				response.addHttp2PushEntity(element.path, element.data, element.httpCode, element.header);
			}, this);
		}

		response.send();
		return true;
	} else {
		response = new ResponseCodeMessage(response).prepareAndGetResponse(true);
		response.send();
		return false;
	}
}


// TODO export Server class
module.exports.Start = Start;
