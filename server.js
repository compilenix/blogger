var Port = Config.server.port || 80;
var HandleClientCacheControl = Config.HandleClientCacheControl || true;
var DevMode = Config.DevMode || false;

var http = undefined;
var https = undefined;
var httpsOptions = {
	key: Config.Https.Key,
	cert: Config.Https.Cert
};

if (Config.EnableHttp2 && Config.Https.Enabled) {
	console.log("Start server with https AND h2 enabled");
	https = require("http2");
} else if (Config.Https.Enabled) {
	console.log("Start server with https enabled");
	https = require("https");
} else {
	console.log("Start server with http");
	http = require("http");
}

var domain = require("domain");
var url = require("url");
var fs = require("fs");
var querystring = require("querystring");

function Start(route) {
	var onErrRes = undefined;

	function onRequest(request, response) {
		const res = new ResponseWrapper(response);

		if (!DevMode) {
			onErrRes = res;
		}

		process_request(request, res, route);
	}

	function onErr(error) {
		console.error("error", error.stack);
		onErrRes.setResponseCode(500);
		onErrRes.setContent("");
		ResponseCodeMessage.ResponseCodeMessage(onErrRes);
		onErrRes.send();
		process.exit(1);
	}

	if (DevMode) {
		console.log("Starting Server on port: " + Port);
		if ((Config.EnableHttp2 && Config.Https.Enabled) || Config.Https.Enabled) {
			https.createServer(httpsOptions, onRequest).listen(Port);
		} else {
			http.createServer(onRequest).listen(Port);
		}
	} else {
		const currentDomain = domain.create();
		currentDomain.on("error", onErr);

		currentDomain.run(function() {
			console.log("Starting Server on port: " + Port);
			if ((Config.EnableHttp2 && Config.Https.Enabled) || Config.Https.Enabled) {
				https.createServer(httpsOptions, onRequest).listen(Port);
			} else {
				http.createServer(onRequest).listen(Port);
			}
		});
	}

	console.log("Init done, waiting for clients/requests...");
}

function process_request(request, response, route) {
	const pathname = url.parse(request.url).pathname;

	if (Config.DevMode) {
		console.log("process_request: " + request.url);
	}

	if (!router.RouteExists(pathname)) {
		if (Config.DevMode) {
			console.log("404: " + (pathname == undefined ? "undefined" : pathname));
		}
		response.setResponseCode(404);
		ResponseCodeMessage.ResponseCodeMessage(response);
		response.send();
		return false;
	}

	if (router.GetRoute(pathname).callback === requestHandlers.Static && (request.headers["cache-control"] !== "no-cache")) {
		const path = Helper.replaceAll("/", Helper.GetFsDelimiter(), Config.staticContentPath);
		let lastModified = undefined;

		if (pathname === "/favicon.ico") {
			lastModified = new Date(fs.statSync(path + Helper.GetFsDelimiter() + "favicon.ico").mtime).toUTCString();
		} else {
			lastModified = new Date(fs.statSync(path + Helper.GetFsDelimiter() + querystring.parse(url.parse(request.url).query)["f"]).mtime).toUTCString(); // TODO fix this
		}

		if (lastModified === request.headers["if-modified-since"]) {
			response.setResponseCode(304);
			response.setLastModified(lastModified);
			response.send();
		}
	}

	let cacheLastModified = Cache.getLastModified(request);
	let cacheHasRequest = Cache.has(request);
	if (cacheHasRequest && request.headers["if-modified-since"] === cacheLastModified) {
		response.setResponseCode(304);
		response.setLastModified(cacheLastModified);
		response.send();
	} else {
		const deliverCache = !(HandleClientCacheControl && request.headers["cache-control"] === "no-cache");
		const writeCache = router.RouteGetCacheEnabled(pathname);
		if (deliverCache && cacheHasRequest) {
			Cache.send(request, response);
			return false;
		}

		var data = route(pathname, request);

		if (request.method === "POST") {
			var body = "";

			request.on("data", function(postData) {
				// reading http POST body
				if (body.length + postData.length < Config.MaxHttpPOSTSize) {
					body += postData;
				} else {
					// Request entity too large
					response.setResponseCode(413);
					ResponseCodeMessage.ResponseCodeMessage(response);
					response.send();
					return false;
				}
				return true;
			});

			request.on("end", function() {
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
			ResponseCodeMessage.ResponseCodeMessage(response);
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

		if (writeCache) {
			Cache.add(request, data.content, data.mimetype, data.code);
			response.setLastModified(Cache.getLastModified(request));
		}

		if (Config.EnableHttp2 && Config.Https.Enabled && data.push) {
			data.push.forEach(function(element) {
				response.addHttp2PushEntity(element.path, element.data, element.httpCode, element.header);
			}, this);
		}

		response.send();

		return true;
	} else {
		ResponseCodeMessage.ResponseCodeMessage(response);
		response.send();
		return false;
	}
}


exports.Start = Start;
